

import sequelize from "../config/database";
import { Op } from "sequelize";
import { 
	Canton,
	ParticipantesAudienciaPruebas,
	AudienciaContestacion,
	AudienciaPruebas,
	Denuncia,
	Otros, 
	ParticipantesAudienciaContestacion,
	MedidasDefinitivas,
	Afectado,
	Avocatoria,
	medida,
	VulneracionesIdentificadas,
	Vulneracion,
	Testimonio, 
	usuarios,
	Resoluciones} from "../models";
	import path from 'path';
import fs from 'fs-extra';
import { supabase } from '../config/supabase';
import { sanitizarRuta } from '../utils/sanitizar rutas';

interface ParticipanteData {
	nombres: string;
	apellidos: string;
	cedula: string;
	tipoParticipante: string;
	asistio?: string;
	pruebas?: string;
	testimonio?: string;
	parte: string;
	archivo?: {
		path: string;
		fileName: string;
	};
}
interface medidaDefinitivaData {
	 idAfectado: number;
    idMedida: number;
    medida: string;
    periodo: string;
    observaciones: string;

}
interface AudienciaPruebasData {
	idDenuncia: number;
	codigoTramite: string;
	fecha: Date;
	hora: Date;
	instalacionAudiencia: string;
	afectadoManifiesta?: string;
	pdf_audiencia_pruebas: string;
	articulo: string;
	participantes: ParticipanteData[];
	archivos?: { [key: string]: Express.Multer.File }; // archivos por índice de participante
	
	estatus: "pendiente"|"en_proceso"|"completada";
}

//--- SERVICIOS PARA AUDIENCIA DE PRUEBAS ---//
// Servicio para obtener todos los datos de la audiencia de pruebas
export async function obtenerAudienciaPruebasCompleta(idAudiencia: number) {
	
	// Buscar la audiencia principal
	const audiencia = await AudienciaPruebas.findByPk(idAudiencia);
	if (!audiencia) {
		throw new Error('No existe la audiencia de pruebas con el id proporcionado');
	}

	// Buscar el cantón de la audiencia (a través de la denuncia)
		let usuariosPrincipales: any[] = [];
		let nombreCanton = '';
		let idResolucion = null;
		const denuncia = await Denuncia.findByPk(audiencia.idDenuncia, { 
			attributes: ['id_canton'],
			include: [
				{
					model: Resoluciones,
					as: 'resoluciones',
					attributes: ['id'],
					
				}
			]
		});
		if (denuncia && denuncia.id_canton) {
			usuariosPrincipales = await usuarios.findAll({
				where: {
					id_canton: denuncia.id_canton,
					rol: 'principal',
					isactivo: true
				},
				attributes: ['id', 'nombres', 'apellidos', 'correo', 'rol', 'id_canton']
			});
			const canton = await Canton.findByPk(denuncia.id_canton, { attributes: ['canton'] });
			if (canton) nombreCanton = canton.canton;
			
			// Extraer ID de la resolución
			const resoluciones = (denuncia as any).resoluciones;
			if (resoluciones && resoluciones.length > 0) {
				idResolucion = resoluciones[0].id;
			}
		}

	// Participantes de la audiencia de pruebas
	const participantes = await ParticipantesAudienciaPruebas.findAll({
		where: { idAP: idAudiencia },
		attributes: ['id', 'nombres', 'apellidos', 'cedula', 'tipoParticipante', 'parte', 'pruebas','pathPruebas']
	});

	// Participantes con testimonio
	const participantesConTestimonio = await Promise.all(
		participantes.map(async (p: any) => {
			const testimonio = await Testimonio.findOne({
				where: { idParticipante: p.id },
				attributes: ['testimonio']
			});
			if (testimonio) {
					return {
					nombres: p.nombres,
					apellidos: p.apellidos,
					cedula: p.cedula,
					tipoParticipante: p.tipoParticipante,
					parte: p.parte,
					
					testimonio: testimonio.testimonio
				};
			}
			return null;
		})
	);
	const participantesConTestimonioFiltrados = participantesConTestimonio.filter(p => p !== null);

	
	// Buscar todos los afectados de la denuncia asociada a la audiencia
	const afectados = await Afectado.findAll({
		where: { idDenuncia: audiencia.idDenuncia },
		attributes: ['id', 'nombres', 'apellidos', 'cedula']
	});

	// Vulneraciones identificadas por afectado
	const vulneracionesPorAfectadoArr = await Promise.all(
		afectados.map(async (afectado: any) => {
			const vulneraciones = await VulneracionesIdentificadas.findAll({
				where: { idAfectado: afectado.id },
				include: [{ model: Vulneracion, as: 'vulneracion', attributes: ['vulneracion'] }],
				attributes: ['id', 'idAfectado', 'idVulneracion', 'detalles']
			});
			return {
				idAfectado: afectado.id,
				nombres: afectado.nombres,
				apellidos: afectado.apellidos,
				cedula: afectado.cedula,
				vulneraciones: vulneraciones.map((v: any) => ({
					id: v.id,
					idVulneracion: v.idVulneracion,
					detalles: v.detalles,
					vulneracion: v.vulneracion?.vulneracion
				}))
			};
		})
	);

	// Medidas definitivas por afectado (fase denuncia)
	const medidasDefinitivasPorAfectado = await Promise.all(
		afectados.map(async (afectado: any) => {
			const medidas = await MedidasDefinitivas.findAll({
				where: { idAfectado: afectado.id },
				include: [{ model: medida, as: 'MedidasD', attributes: ['medidas'] }],
				attributes: ['idMedida', 'periodo', 'observaciones']
			});
			
			return {
				idAfectado: afectado.id,
				nombres: afectado.nombres,
				apellidos: afectado.apellidos,
				cedula: afectado.cedula,
				medidas: medidas.map((m: any) => ({
					idMedida: m.idMedida,
					medida: m.MedidasD?.medidas,
					periodo: m.periodo,
					observaciones: m.observaciones
				}))
			};
		})
		
	);
	

	// Estructura de respuesta
		return {
			idDenuncia: audiencia.idDenuncia,
			idResolucion: idResolucion,
			codigoTramite: audiencia.codigoTramite,
			fecha: audiencia.fecha,
			hora: audiencia.hora,
			articulo: audiencia.articulo,
			instalacionAudiencia: audiencia.instalacionAudiencia,
			afectadoManifiesta: audiencia.afectadoManifiesta,
			pdf_audiencia_pruebas: audiencia.pdf_audiencia_pruebas,
			estatus: audiencia.estatus,
			canton: nombreCanton,
			participantes: participantes.map(p => ({
				nombres: p.nombres,
				apellidos: p.apellidos,
				cedula: p.cedula,
				tipoParticipante: p.tipoParticipante,
				parte: p.parte,
				pruebas: p.pruebas,
				pathPruebas: p.pathPruebas? "archivo disponible": "sin archivo",
				ruta: p.pathPruebas || null
			})),
			medidasDefinitivas: medidasDefinitivasPorAfectado,
			usuariosPrincipalesCanton: usuariosPrincipales,
					participantesConTestimonio: participantesConTestimonioFiltrados,
					vulneracionesPorAfectado: vulneracionesPorAfectadoArr
				};
}
//crear audiencia de pruebas
export async function crearAudienciaPruebas(data: AudienciaPruebasData) {
	const t = await sequelize.transaction();
	try {
		const audiencia = await AudienciaPruebas.create({
			idDenuncia: data.idDenuncia,
			codigoTramite: data.codigoTramite,
			fecha: data.fecha,
			hora: data.hora,
			instalacionAudiencia: data.instalacionAudiencia,
			afectadoManifiesta: data.afectadoManifiesta,
			pdf_audiencia_pruebas: data.pdf_audiencia_pruebas,
			articulo: data.articulo,
			estatus:  'completada',
		}, { transaction: t });
		// Crear medidas emergentes asociadas en la tabla medidas_emergentes
		

		if (Array.isArray(data.participantes)) {
			for (const participante of data.participantes) {
				// Crear participante
				const nuevoParticipante = await ParticipantesAudienciaPruebas.create({
					idAP: audiencia.id,
					nombres: participante.nombres,
					apellidos: participante.apellidos,
					cedula: participante.cedula,
					tipoParticipante: participante.tipoParticipante,
					parte: participante.parte ?? '',
					pruebas: participante.pruebas ?? ''
				}, { transaction: t });
				// Si hay testimonio, crear registro en tabla Testimonio
				if (participante.testimonio && participante.testimonio.trim() !== "") {
					await Testimonio.create({
						testimonio: participante.testimonio,
						idParticipante: nuevoParticipante.id,
						parte: participante.parte // Asignar el tipo de participante como parte
					}, { transaction: t });
				}
			}
		}


		await t.commit();
		return { success: true, audienciaId: audiencia.id };
	} catch (error) {
		await t.rollback();
		throw error;
	}
}

// Servicio para actualizar la audiencia de pruebas
export async function actualizarAudienciaPruebas(idDenuncia: number, data: AudienciaPruebasData) {
	const existeResolucion = await Resoluciones.findOne({where:{idDenuncia:idDenuncia}})
  if (existeResolucion) {
    const error = new Error("no se puede editar ya existe una resolucion registrada en esta denuncia ");
    error.name = "noSePuedeEditar";
    throw error;
  }
	const t = await sequelize.transaction();
	try {
		const audiencia = await AudienciaPruebas.findOne({where:{idDenuncia:idDenuncia}});
		if (!audiencia) {
			throw new Error('No existe la audiencia de pruebas con el id proporcionado');
		}
		await audiencia.update({
			idDenuncia: data.idDenuncia,
			codigoTramite: data.codigoTramite,
			fecha: data.fecha,
			hora: data.hora,
			instalacionAudiencia: data.instalacionAudiencia,
			afectadoManifiesta: data.afectadoManifiesta,
			pdf_audiencia_pruebas: data.pdf_audiencia_pruebas
		}, { transaction: t });

		// Actualizar participantes: eliminar los existentes y crear los nuevos
		// Obtener participantes existentes para limpiar testimonios relacionados
		const participantesExistentes = await ParticipantesAudienciaPruebas.findAll({ where: { idAP: audiencia.idAP }, attributes: ['id'], transaction: t });
		const participantesExistentesIds = participantesExistentes.map((p: any) => p.id);
		if (participantesExistentesIds.length > 0) {
			await Testimonio.destroy({ where: { idParticipante: participantesExistentesIds }, transaction: t });
		}

		// Eliminar participantes antiguos
		await ParticipantesAudienciaPruebas.destroy({ where: { idAP: audiencia.idAP }, transaction: t });

		// Crear y, si corresponde, crear testimonios para los nuevos participantes
		if (Array.isArray(data.participantes)) {
			for (const participante of data.participantes) {
				const nuevoParticipante = await ParticipantesAudienciaPruebas.create({
					idAP: audiencia.id,
					nombres: participante.nombres,
					apellidos: participante.apellidos,
					cedula: participante.cedula,
					tipoParticipante: participante.tipoParticipante,
					parte: participante.parte ?? '',
					pruebas: participante.pruebas ?? ' null'
				}, { transaction: t });

				if (participante.testimonio && participante.testimonio.trim() !== '') {
					await Testimonio.create({
						testimonio: participante.testimonio,
						idParticipante: nuevoParticipante.id,
						parte: participante.parte ?? ''
					}, { transaction: t });
				}
			}
		}

		await t.commit();
		return { success: true, audienciaId: audiencia.id };
	} catch (error) {
		await t.rollback();
		throw error;
	}
}

//servicio para obtener datos de la audiencia de pruebas
export async function AudienciaPruebasDTO(id:string) {
  

	const resultado = await Denuncia.findByPk(id, {
		attributes: ['codigoTramite'],
		include: [
			{
				model: Avocatoria,
				as: 'avocatoria',
				attributes: ['articulo']
			},
			{
				model: Canton,
				attributes: ['canton'],
				as: "canton"
			},
			{
				model: AudienciaPruebas,
				as: "ap",
				attributes: ['id']
			}
			
		]
	});

	

	const { codigoTramite, avocatoria: avo, canton: can, ap:audienciaPruebas } = resultado as any;

	const respuestaFormateada = {
		codigoTramite,
		articulo: avo?.articulo || '',
		Canton: can?.canton || '',
		id: audienciaPruebas?.id || null

	};
	

	return respuestaFormateada;
}


//servicio para obtener las vulneraciones identificadas por afectados
export const vulneracionesPorAfectado = async (afectadoId: number) => {
  const afectado = await Afectado.findByPk(afectadoId, {
	attributes: ['id', 'nombres'],
	include: [
	  {
		model: VulneracionesIdentificadas,
		as: "vulneracionesI",
		attributes: ['id','idAfectado','idVulneracion','detalles'],
		include: [
		  {
			model: Vulneracion,
			as: "vulneracion", // ← importante: debe coincidir con el modelo
			attributes: ['vulneracion'],
		  },
		],
	  },
	],
  });

  if (!afectado) return [];
  

  const resultadoFormateado = [];

  for (const mi of afectado.vulneracionesI || []) {
   
	if (mi.vulneracion?.vulneracion) {
	  resultadoFormateado.push({
		id: mi.id,
		idVulneracion: mi.idVulneracion,
		idAfectado: afectado.id,
		nombres: afectado.nombres,
		vulneracion: mi.vulneracion.vulneracion,
		detalles: mi.detalles
	  });
	}
  }
  console.log("Medidas identificadas:", resultadoFormateado);
  return resultadoFormateado;
};
// Servicio para agregar vulneraciones identificadas a un afectado
export async function agregarVulneracionIdentificada(data: {
	idAfectado: number;
	idVulneracion: number;
	detalles?: string;
}) {
	// Validar datos mínimos
	if (!data.idAfectado || !data.idVulneracion) {
		throw new Error("Faltan datos obligatorios: idAfectado o idVulneracion");
	}

	// Crear la vulneración identificada
	const nuevaVulneracion = await VulneracionesIdentificadas.create({
		idAfectado: data.idAfectado,
		idVulneracion: data.idVulneracion,
		detalles: data.detalles ?? ''
	});

	return nuevaVulneracion;
}

// Servicio para eliminar vulneración identificada por id
export async function eliminarVulneracionIdentificada(id: number) {
	if (!id) throw new Error('ID requerido');
	const deleted = await VulneracionesIdentificadas.destroy({ where: { id } });
	if (deleted === 0) throw new Error('No se encontró la vulneración identificada');
	return { success: true };
}

// Servicio para actualizar vulneración identificada por id
export async function actualizarVulneracionIdentificada(id: number, data: { idAfectado?: number; idVulneracion?: number; detalles?: string; }) {
	if (!id) throw new Error('ID requerido');
	
	const vulneracion = await VulneracionesIdentificadas.findByPk(id);
	if (!vulneracion) throw new Error('No se encontró la vulneración identificada');
	await vulneracion.update({
		idAfectado: data.idAfectado ?? vulneracion.idAfectado,
		idVulneracion: data.idVulneracion ?? vulneracion.idVulneracion,
		detalles: data.detalles ?? vulneracion.detalles
	});
	return vulneracion;
}






//----------------SERVICIO PARA PARTICIPANTES----------------------//

// Obtener los nombres de los afectados y el campo diriguidoA de citaciones para una denuncia
export async function getParticipantesAudienciaContestacion(idDenuncia: number) {
	// Buscar la audiencia de contestación asociada a la denuncia
	const audiencia = await AudienciaContestacion.findOne({ where: { idDenuncia } });
	if (!audiencia) return [];

	// Participantes de la audiencia de contestación
	const participantesAudiencia = await ParticipantesAudienciaContestacion.findAll({
		where: {
			idAC: audiencia.id,
            tipoParticipante: { [Op.not]: 'representante' }
		},
		attributes: ['nombres','apellidos', 'cedula', 'tipoParticipante']
	});

	// Participantes de la tabla Otros con fase 'audienciaPruebas' y idDenuncia coincidente
	const otrosParticipantes = await Otros.findAll({
		where: {
			idDenuncia,
			fase: 'audienciaPruebas'

		},
		attributes: ['nombres','apellidos', 'cedula', 'tipoParticipante']
	});

	// Unir ambos arreglos y devolver
	const todosParticipantes = [
		...participantesAudiencia,
		...otrosParticipantes
	];
	return todosParticipantes;
}

export async function AgregarOtrosParticipantes(data: any) {
    // params: { nombres, apellidos, cedula, tipoParticipante, idDenuncia }
  const { nombres, apellidos, cedula, tipoParticipante, idDenuncia } = data;
  
  const nuevoParticipante = await Otros.create({
    nombres,
    apellidos,
    cedula,
    tipoParticipante,
    idDenuncia,
    fase: 'audienciaPruebas'
  });
  return nuevoParticipante;
}

//---- FUNCIONES PARA MANEJO DE ARCHIVOS POR ABOGADO ----//

// Función para procesar archivos específicos por abogado


// 1. Modificamos esta función para que solo vincule el archivo (con su buffer) al participante
export function procesarArchivosAbogados(files: Express.Multer.File[], participantes: any[]) {
    const participantesConArchivos = [...participantes];
    
    if (files && files.length > 0) {
        files.forEach((file) => {
            const match = file.fieldname.match(/archivo_abogado_(\d+)/);
            
            if (match) {
                const participanteIndex = parseInt(match[1]);
                
                if (participanteIndex < participantesConArchivos.length && 
                    participantesConArchivos[participanteIndex].tipoParticipante === 'Abogado') {
                    
                    // ¡En lugar de rutas, guardamos el archivo de Multer completo temporalmente!
                    participantesConArchivos[participanteIndex].archivoCrudo = file;
                    
                }
            }
        });
    }
    
    return participantesConArchivos;
}

// 2. La función principal ahora guarda los archivos de verdad
export async function crearAudienciaPruebasConArchivos(data: any, files: Express.Multer.File[]) {
    const t = await sequelize.transaction();
    const storageType = process.env.STORAGE_TYPE || 'local';
    
    // Arreglo para guardar los paths de los archivos subidos (útil para limpiar si hay rollback)
    const archivosSubidos: string[] = []; 

    try {
        // 1. Crear audiencia principal
        const audiencia = await AudienciaPruebas.create({
            idDenuncia: data.idDenuncia,
            codigoTramite: data.codigoTramite,
            fecha: data.fecha,
            hora: data.hora,
            instalacionAudiencia: data.instalacionAudiencia,
            afectadoManifiesta: data.afectadoManifiesta,
            pdf_audiencia_pruebas: data.pdf_audiencia_pruebas, // Asumo que este ya viene subido de otro lado
            articulo: data.articulo,
            estatus: 'completada',
        }, { transaction: t });

        // 2. Emparejar archivos con abogados
        const participantesConArchivos = procesarArchivosAbogados(files, data.participantes);

        if (Array.isArray(participantesConArchivos)) {
            for (const participante of participantesConArchivos) {
                let pathPruebasDB = null;

                // 3. SI EL ABOGADO TIENE UN ARCHIVO, LO SUBIMOS AHORA
                if (participante.tipoParticipante === 'Abogado' && participante.archivoCrudo) {
                    const file = participante.archivoCrudo;
                    const carpetaBase = data.codigoTramite ? sanitizarRuta(data.codigoTramite) : 'generales';
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E5);
                    const nombreGenerado = `${uniqueSuffix}-${file.originalname}`;
                    const rutaRelativa =sanitizarRuta(`${data.codigoTramite}/pruebas/${nombreGenerado}`) ;

                    if (storageType === 'cloud') {
                        const { error: uploadError } = await supabase.storage
                            .from('expedientes')
                            .upload(rutaRelativa, file.buffer, { contentType: file.mimetype, upsert: false });
                        
                        if (uploadError) throw uploadError;
                        
                        pathPruebasDB = rutaRelativa;
                        archivosSubidos.push(rutaRelativa); // Guardar para posible rollback
                    } else {
                        const baseDir = path.resolve('uploads', `${data.codigoTramite}`, 'pruebas');
                        const fullPath = path.join(baseDir, nombreGenerado);
                        
                        await fs.ensureDir(baseDir);
                        await fs.writeFile(fullPath, file.buffer);
                        
                        pathPruebasDB = `/uploads/${rutaRelativa.replace(/\\/g, '/')}`;
                        archivosSubidos.push(fullPath); // Guardar para posible rollback
                    }
                }

                // 4. Crear participante en DB
                const nuevoParticipante = await ParticipantesAudienciaPruebas.create({
                    idAP: audiencia.id,
                    nombres: participante.nombres,
                    apellidos: participante.apellidos,
                    cedula: participante.cedula,
                    tipoParticipante: participante.tipoParticipante,
                    parte: participante.parte ?? '',
                    pruebas: participante.pruebas ?? '',
                    pathPruebas: pathPruebasDB // La ruta final (Local o Supabase)
                }, { transaction: t });

                // 5. Crear testimonio si existe
                if (participante.testimonio && participante.testimonio.trim() !== "") {
                    await Testimonio.create({
                        testimonio: participante.testimonio,
                        idParticipante: nuevoParticipante.id,
                        parte: participante.parte
                    }, { transaction: t });
                }
            }
        }

        await t.commit();
        return { success: true, audienciaId: audiencia.id };
        
    } catch (error) {
        await t.rollback();
        
        // 🧹 LIMPIEZA MULTIPLE: Si la BD falla, borramos TODOS los archivos que se hayan alcanzado a subir en el ciclo for
        for (const pathGuardado of archivosSubidos) {
            try {
                if (storageType === 'local' && fs.existsSync(pathGuardado)) {
                    fs.unlinkSync(pathGuardado);
                } else if (storageType === 'cloud') {
                    await supabase.storage.from('expedientes').remove([pathGuardado]);
                }
            } catch (cleanupError) {
                console.error(`Error borrando archivo huérfano ${pathGuardado}:`, cleanupError);
            }
        }

        throw error;
    }
}

// Función para procesar archivos específicos por abogado en edición


// 1. La función procesadora ahora solo clasifica qué participante lleva archivo crudo o viejo
export function procesarArchivosAbogadosEdicion(
    files: Express.Multer.File[], 
    participantesNuevos: any[], 
    participantesViejos: any[]
) {
    const participantesProcesados = [...participantesNuevos];
    
    // Mapa para ubicar rápido los archivos viejos por el índice del participante
    // (Asumimos que el orden en el arreglo del frontend se mantiene)
    const archivosViejos = new Map();
    participantesViejos.forEach((p, index) => {
        if (p.pathPruebas && p.tipoParticipante === 'Abogado') {
            archivosViejos.set(index, p.pathPruebas);
        }
    });

    const indicesConArchivosNuevos = new Set();
    
    // A) Asignar los archivos NUEVOS (los crudos de multer en RAM)
    if (Array.isArray(files) && files.length > 0) {
        files.forEach(file => {
            if (file.fieldname && file.fieldname.startsWith('archivo_abogado_')) {
                const index = parseInt(file.fieldname.split('_')[2]);
                if (!isNaN(index) && participantesProcesados[index]?.tipoParticipante === 'Abogado') {
                    // Guardamos el buffer temporal para subirlo después
                    participantesProcesados[index].archivoCrudo = file;
                    indicesConArchivosNuevos.add(index);
                }
            }
        });
    }

    // B) Asignar los archivos VIEJOS a los que no subieron archivo nuevo
    participantesProcesados.forEach((p, index) => {
        if (p.tipoParticipante === 'Abogado' && !indicesConArchivosNuevos.has(index) && archivosViejos.has(index)) {
            // Le decimos a la base de datos que conserve la ruta vieja
            p.pathPruebasConservado = archivosViejos.get(index);
        }
    });

    return { 
        participantesProcesados, 
        indicesReemplazados: indicesConArchivosNuevos 
    };
}

// 2. Función Principal Híbrida
export async function actualizarAudienciaPruebasConArchivos(id: number, data: any, files: Express.Multer.File[]) {
    const t = await sequelize.transaction();
    const storageType = process.env.STORAGE_TYPE || 'local';
    const archivosNuevosSubidos: string[] = []; // Para rollback
    
    try {
        const audienciaExistente = await AudienciaPruebas.findByPk(id);
        if (!audienciaExistente) throw new Error('Audiencia de pruebas no encontrada');

        const participantesExistentes = await ParticipantesAudienciaPruebas.findAll({
            where: { idAP: id },
            transaction: t
        });

        // 1. Clasificar participantes (nuevos vs viejos archivos)
        const { participantesProcesados, indicesReemplazados } = procesarArchivosAbogadosEdicion(
            files, data.participantes, participantesExistentes
        );

        // 2. BORRAR FÍSICAMENTE LOS ARCHIVOS VIEJOS REEMPLAZADOS
        for (let i = 0; i < participantesExistentes.length; i++) {
            const pViejo = participantesExistentes[i];
            // Si el participante tenía archivo y ahora mandaron uno nuevo (o lo borraron del todo)
            // Asumo que si el índice está en 'indicesReemplazados' o si el abogado ya no está en el nuevo arreglo, se debe borrar
            const fueReemplazado = indicesReemplazados.has(i);
            const fueEliminado = !data.participantes[i]; 

            if (pViejo.pathPruebas && (fueReemplazado || fueEliminado)) {
                try {
                    if (storageType === 'local') {
                        const rutaAbsoluta = path.join(process.cwd(), pViejo.pathPruebas);
                        if (fs.existsSync(rutaAbsoluta)) fs.unlinkSync(rutaAbsoluta);
                    } else if (storageType === 'cloud') {
                        await supabase.storage.from('expedientes').remove([pViejo.pathPruebas]);
                    }
                } catch (error) {
                    console.error(`Error no fatal borrando archivo ${pViejo.pathPruebas}:`, error);
                }
            }
        }

        // 3. ACTUALIZAR AUDIENCIA
        await audienciaExistente.update({
            fecha: data.fecha, hora: data.hora, instalacionAudiencia: data.instalacionAudiencia,
            afectadoManifiesta: data.afectadoManifiesta, pdf_audiencia_pruebas: data.pdf_audiencia_pruebas,
            articulo: data.articulo, estatus: data.estatus
        }, { transaction: t });

        // 4. LIMPIEZA DE TABLAS HIJAS
        if (participantesExistentes.length > 0) {
            const participantesIds = participantesExistentes.map(p => p.id);
            await Testimonio.destroy({ where: { idParticipante: participantesIds }, transaction: t });
            await ParticipantesAudienciaPruebas.destroy({ where: { idAP: id }, transaction: t });
        }

        // 5. RECREAR PARTICIPANTES Y SUBIR ARCHIVOS NUEVOS
        if (Array.isArray(participantesProcesados)) {
            for (const participante of participantesProcesados) {
                let finalPathDB = participante.pathPruebasConservado || null;

                // Si es un abogado con archivo NUEVO, lo subimos ahora mismo
                if (participante.tipoParticipante === 'Abogado' && participante.archivoCrudo) {
                    const file = participante.archivoCrudo;
                    const carpetaBase = data.codigoTramite ? sanitizarRuta(data.codigoTramite) : 'generales';
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E5);
                    
					const rutaRelativa =`${data.codigoTramite}/pruebas/${uniqueSuffix}-${file.originalname}` ;
                    const rutaSanitizada =sanitizarRuta(rutaRelativa)
                    if (storageType === 'cloud') {
						
                        const { error: uploadError } = await supabase.storage
                            .from('expedientes')
                            .upload(rutaSanitizada, file.buffer, { contentType: file.mimetype, upsert: false });
                        if (uploadError) throw uploadError;
                        finalPathDB = rutaSanitizada;
                    } else {
                        const baseDir = path.resolve('uploads', String(data.codigoTramite),'pruebas');
                        const fullPath = path.join(baseDir, `${uniqueSuffix}-${file.originalname}`);
                        await fs.ensureDir(baseDir);
                        await fs.writeFile(fullPath, file.buffer);
                        finalPathDB = `/uploads/${rutaRelativa.replace(/\\/g, '/')}`;
                        archivosNuevosSubidos.push(fullPath); // Guardar para posible rollback local
                    }
                    if(storageType === 'cloud') archivosNuevosSubidos.push(rutaSanitizada); // Guardar para posible rollback cloud
                }

                // Crear el participante en DB
                const nuevoParticipante = await ParticipantesAudienciaPruebas.create({
                    idAP: id, nombres: participante.nombres, apellidos: participante.apellidos,
                    cedula: participante.cedula, tipoParticipante: participante.tipoParticipante,
                    parte: participante.parte ?? '', pruebas: participante.pruebas ?? '',
                    pathPruebas: finalPathDB
                }, { transaction: t });

                // Crear testimonio
                if (participante.testimonio && participante.testimonio.trim() !== "") {
                    await Testimonio.create({
                        testimonio: participante.testimonio, idParticipante: nuevoParticipante.id,
                        parte: participante.parte
                    }, { transaction: t });
                }
            }
        }

        await t.commit();
        return { success: true, message: 'Audiencia de pruebas actualizada exitosamente' };

    } catch (error) {
        await t.rollback();
        
        // 🧹 LIMPIEZA MULTIPLE SI HAY FALLA: Borrar los archivos que se alcanzaron a subir antes del error
        for (const pathGuardado of archivosNuevosSubidos) {
            try {
                if (storageType === 'local' && fs.existsSync(pathGuardado)) fs.unlinkSync(pathGuardado);
                else if (storageType === 'cloud') await supabase.storage.from('expedientes').remove([pathGuardado]);
            } catch (cleanupError) {
                console.error(`Error borrando archivo huérfano ${pathGuardado}:`, cleanupError);
            }
        }
        throw error;
    }
}
