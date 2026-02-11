

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
export async function actualizarAudienciaPruebas(idAudiencia: number, data: AudienciaPruebasData) {
	const t = await sequelize.transaction();
	try {
		const audiencia = await AudienciaPruebas.findByPk(idAudiencia);
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
		const participantesExistentes = await ParticipantesAudienciaPruebas.findAll({ where: { idAP: idAudiencia }, attributes: ['id'], transaction: t });
		const participantesExistentesIds = participantesExistentes.map((p: any) => p.id);
		if (participantesExistentesIds.length > 0) {
			await Testimonio.destroy({ where: { idParticipante: participantesExistentesIds }, transaction: t });
		}

		// Eliminar participantes antiguos
		await ParticipantesAudienciaPruebas.destroy({ where: { idAP: idAudiencia }, transaction: t });

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
	console.log(respuestaFormateada);

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
  console.log("Afectado encontrado:", afectado.toJSON());

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
export function procesarArchivosAbogados(files: Express.Multer.File[], participantes: ParticipanteData[]): ParticipanteData[] {
	const participantesConArchivos = [...participantes];
	
	if (files && files.length > 0) {
		files.forEach((file) => {
			// Extraer índice del participante del nombre del campo
			// Formato esperado: "archivo_abogado_0", "archivo_abogado_1", etc.
			const match = file.fieldname.match(/archivo_abogado_(\d+)/);
			
			if (match) {
				const participanteIndex = parseInt(match[1]);
				
				// Verificar que el índice sea válido y que sea tipo "Abogado"
				if (participanteIndex < participantesConArchivos.length && 
					participantesConArchivos[participanteIndex].tipoParticipante === 'Abogado') {
					
					// Normalizar ruta para evitar problemas con barras invertidas
					const filePath = (file.path || `${file.destination}/${file.filename}`).replace(/\\/g, '/');
					
					// Asignar archivo al abogado específico
					participantesConArchivos[participanteIndex].archivo = {
						path: filePath,
						fileName: file.originalname || file.filename
					};
					
					console.log(`Archivo asignado a abogado ${participanteIndex}: ${file.originalname}`);
				} else {
					console.warn(`Archivo para participante índice ${participanteIndex}: no es abogado o índice inválido`);
				}
			} else {
				console.warn(`Nombre de campo no válido para archivo: ${file.fieldname}`);
			}
		});
	}
	
	return participantesConArchivos;
}

// Función para crear audiencia con archivos específicos por abogado
export async function crearAudienciaPruebasConArchivos(data: AudienciaPruebasData, files: Express.Multer.File[]) {
	const t = await sequelize.transaction();
	try {
		// Crear audiencia principal
		const audiencia = await AudienciaPruebas.create({
			idDenuncia: data.idDenuncia,
			codigoTramite: data.codigoTramite,
			fecha: data.fecha,
			hora: data.hora,
			instalacionAudiencia: data.instalacionAudiencia,
			afectadoManifiesta: data.afectadoManifiesta,
			pdf_audiencia_pruebas: data.pdf_audiencia_pruebas,
			articulo: data.articulo,
			estatus: 'completada',
		}, { transaction: t });

		// Procesar archivos específicos por abogado
		const participantesConArchivos = procesarArchivosAbogados(files, data.participantes);

		if (Array.isArray(participantesConArchivos)) {
			for (const participante of participantesConArchivos) {
				// Determinar pathPruebas basado en si es abogado y tiene archivo
				let pathPruebas = null;
				if (participante.tipoParticipante === 'Abogado' && participante.archivo) {
					pathPruebas = participante.archivo.path;
				}

				// Crear participante con su archivo específico
				const nuevoParticipante = await ParticipantesAudienciaPruebas.create({
					idAP: audiencia.id,
					nombres: participante.nombres,
					apellidos: participante.apellidos,
					cedula: participante.cedula,
					tipoParticipante: participante.tipoParticipante,
					parte: participante.parte ?? '',
					pruebas: participante.pruebas ?? '',
					pathPruebas: pathPruebas
				}, { transaction: t });

				// Si hay testimonio, crear registro en tabla Testimonio
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
		throw error;
	}
}

// Función para procesar archivos específicos por abogado en edición
export function procesarArchivosAbogadosEdicion(files: Express.Multer.File[], participantes: ParticipanteData[], participantesExistentes: any[]): ParticipanteData[] {
	const participantesConArchivos = [...participantes];
	
	// Crear un mapa de archivos existentes por índice para conservarlos
	const archivosExistentes = new Map();
	participantesExistentes.forEach((participante, index) => {
		if (participante.pathPruebas && participante.tipoParticipante === 'Abogado') {
			archivosExistentes.set(index, {
				path: participante.pathPruebas,
				fileName: participante.pathPruebas.split('/').pop() || participante.pathPruebas.split('\\').pop()
			});
		}
	});

	// Si no hay archivos nuevos, conservar los existentes
	if (!Array.isArray(files) || files.length === 0) {
		// Aplicar archivos existentes a participantes que no tienen archivos nuevos
		participantesConArchivos.forEach((participante, index) => {
			if (participante.tipoParticipante === 'Abogado' && archivosExistentes.has(index)) {
				participante.archivo = archivosExistentes.get(index);
			}
		});
		return participantesConArchivos;
	}

	// Crear set de índices que tendrán archivos nuevos
	const indicesConArchivosNuevos = new Set();
	
	// Procesar cada archivo subido
	files.forEach(file => {
		if (file.fieldname && file.fieldname.startsWith('archivo_abogado_')) {
			const index = parseInt(file.fieldname.split('_')[2]);
			if (!isNaN(index) && participantesConArchivos[index] && participantesConArchivos[index].tipoParticipante === 'Abogado') {
				// Normalizar la ruta del archivo (cambiar backslashes por forward slashes)
				const normalizedPath = file.path.replace(/\\/g, '/');
				
				participantesConArchivos[index].archivo = {
					path: normalizedPath,
					fileName: file.filename
				};
				
				indicesConArchivosNuevos.add(index);
			}
		}
	});

	// Para participantes que no tienen archivos nuevos, conservar los existentes
	participantesConArchivos.forEach((participante, index) => {
		if (participante.tipoParticipante === 'Abogado' && 
			!indicesConArchivosNuevos.has(index) && 
			archivosExistentes.has(index)) {
			participante.archivo = archivosExistentes.get(index);
		}
	});

	return participantesConArchivos;
}

// Función para actualizar audiencia con archivos específicos por abogado
export async function actualizarAudienciaPruebasConArchivos(id: number, data: AudienciaPruebasData, files: Express.Multer.File[]) {
	const t = await sequelize.transaction();
	const fs = require('fs');
	const path = require('path');
	
	try {
		// Verificar que la audiencia existe
		const audienciaExistente = await AudienciaPruebas.findByPk(id);
		if (!audienciaExistente) {
			throw new Error('Audiencia de pruebas no encontrada');
		}

		// PRIMERO: Obtener participantes existentes con sus archivos completos
		const participantesExistentes = await ParticipantesAudienciaPruebas.findAll({
			where: { idAP: id },
			attributes: ['id', 'nombres', 'apellidos', 'cedula', 'tipoParticipante', 'parte', 'pruebas', 'pathPruebas'],
			transaction: t
		});

		// Identificar qué archivos nuevos se están subiendo
		const indicesConArchivosNuevos = new Set();
		if (Array.isArray(files) && files.length > 0) {
			files.forEach(file => {
				if (file.fieldname && file.fieldname.startsWith('archivo_abogado_')) {
					const index = parseInt(file.fieldname.split('_')[2]);
					if (!isNaN(index)) {
						indicesConArchivosNuevos.add(index);
					}
				}
			});
		}

		// Eliminar SOLO los archivos que van a ser reemplazados
		for (let i = 0; i < participantesExistentes.length; i++) {
			const participante = participantesExistentes[i];
			if (participante.pathPruebas && indicesConArchivosNuevos.has(i)) {
				try {
					// Convertir ruta relativa a absoluta
					const rutaAbsoluta = path.resolve(participante.pathPruebas);
					if (fs.existsSync(rutaAbsoluta)) {
						fs.unlinkSync(rutaAbsoluta);
						console.log(`Archivo reemplazado eliminado: ${rutaAbsoluta}`);
					}
				} catch (error) {
					console.error(`Error al eliminar archivo ${participante.pathPruebas}:`, error);
					// No detenemos la transacción por errores de archivos
				}
			}
		}

		// Actualizar datos principales de la audiencia
		await AudienciaPruebas.update({
			fecha: data.fecha,
			hora: data.hora,
			instalacionAudiencia: data.instalacionAudiencia,
			afectadoManifiesta: data.afectadoManifiesta,
			pdf_audiencia_pruebas: data.pdf_audiencia_pruebas,
			articulo: data.articulo,
			estatus: data.estatus
		}, { 
			where: { id },
			transaction: t 
		});

		// Eliminar testimonios asociados a los participantes
		if (participantesExistentes.length > 0) {
			const participantesIds = participantesExistentes.map(p => p.id);
			await Testimonio.destroy({
				where: { idParticipante: participantesIds },
				transaction: t
			});
		}

		// Eliminar participantes existentes
		await ParticipantesAudienciaPruebas.destroy({
			where: { idAP: id },
			transaction: t
		});

		// Procesar archivos específicos por abogado
		const participantesConArchivos = procesarArchivosAbogadosEdicion(files, data.participantes, participantesExistentes);

		// Crear nuevos participantes con archivos actualizados
		if (Array.isArray(participantesConArchivos)) {
			for (const participante of participantesConArchivos) {
				// Determinar pathPruebas basado en si es abogado y tiene archivo
				let pathPruebas = null;
				if (participante.tipoParticipante === 'Abogado' && participante.archivo) {
					pathPruebas = participante.archivo.path;
				}

				// Crear participante con su archivo específico
				const nuevoParticipante = await ParticipantesAudienciaPruebas.create({
					idAP: id,
					nombres: participante.nombres,
					apellidos: participante.apellidos,
					cedula: participante.cedula,
					tipoParticipante: participante.tipoParticipante,
					parte: participante.parte ?? '',
					pruebas: participante.pruebas ?? '',
					pathPruebas: pathPruebas
				}, { transaction: t });

				// Si hay testimonio, crear registro en tabla Testimonio
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
		return { success: true, message: 'Audiencia de pruebas actualizada exitosamente' };
	} catch (error) {
		await t.rollback();
		throw error;
	}
}
