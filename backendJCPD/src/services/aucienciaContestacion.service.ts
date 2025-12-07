
import { Afectado } from "../models/afectado.models";
import { Citacion } from "../models/citaciones.model";
import sequelize from "../config/database";
import { Op } from "sequelize";
import { AudienciaContestacion } from "../models/audiencia_constestacion.model";
import { ParticipantesAudienciaContestacion } from "../models/participantes_audiencia.model";
import { Avocatoria, Canton, Denuncia, Denunciado, Denunciante, Otros, usuarios, AudienciaPruebas } from "../models";
import { MedidasEmergentes, medida } from "../models";

interface ParticipanteData {
	nombres: string;
	apellidos: string;
	cedula: string;
	tipoParticipante: string;
	asistio?: boolean;
	justifico?: boolean;
	manifiesta?: string;
}

interface AudienciaContestacionData {
	idDenuncia: number;
	codigoTramite: string;
	fecha: Date;
	hora: Date;
	instalacionAudiencia: string;
	dirigue: string;
	indica: string;
	manifiesta: string;
	afectadoManifiesta?: string;
	pdf_audiencia_contestacion: number;
	seRatifica: string;
	participantes: ParticipanteData[];
	  estatus: "pendiente"|"en_proceso"|"completada";
}
//--- SERVICIOS PARA AUDIENCIA DE CONTESTACION ---//
//crear audiencia de contestacion
export async function crearAudienciaContestacion(data: AudienciaContestacionData) {
	const t = await sequelize.transaction();
	try {
		const audiencia = await AudienciaContestacion.create({
			idDenuncia: data.idDenuncia,
			codigoTramite: data.codigoTramite,
			fecha: data.fecha,
			hora: data.hora,
			instalacionAudiencia: data.instalacionAudiencia,
			dirigue: data.dirigue,
			indica: data.indica,
			manifiesta: data.manifiesta,
			seRatifica: data.seRatifica,
			afectadoManifiesta: data.afectadoManifiesta,
			pdf_audiencia_contestacion: data.pdf_audiencia_contestacion,
			estatus:  'completada',
		}, { transaction: t });

		if (Array.isArray(data.participantes)) {
			for (const participante of data.participantes) {
				await ParticipantesAudienciaContestacion.create({
					idAC: audiencia.id,
					nombres: participante.nombres,
					apellidos: participante.apellidos,
					cedula: participante.cedula,
					tipoParticipante: participante.tipoParticipante,
					asistio: participante.asistio ?? false,
					justifico: participante.justifico ?? false,
					manifiesta: participante.manifiesta ?? ''
				}, { transaction: t });
			}
		}

		await t.commit();
		return audiencia;
	} catch (error) {
		await t.rollback();
		throw error;
	}
}

//obtener datos para la audiencia de contestacion
export async function AudiencaContestacionDTO(id:string) {
  const existeAvocatoria = await Avocatoria.findOne({ where: { idDenuncia: id } });

  if(!existeAvocatoria) {
	const error = new Error("No existe una avocatoria para esta denuncia");
	error.name = "NoExisteAvocatoria";
	throw error;
  }

	const resultado = await Denuncia.findByPk(id, {
		attributes: ['codigoTramite'],
		include: [
			{
				model: Avocatoria,
				as: 'avocatoria',
				attributes: ['fechaCreado']
			},
			{
				model: Canton,
				attributes: ['canton'],
				as: "canton"
			},
			{
				model:AudienciaContestacion,
				as: "ac" ,
				attributes: ['id'],
			}
		]
	});

	// Obtener fecha y hora de la tabla citacion
	const citacion = await Citacion.findOne({
		where: { idDenuncia: id },
		attributes: ['fecha', 'hora'],
		order: [['fecha', 'ASC']]
	});

	const { codigoTramite, avocatoria: avo, canton: can, ac: audienciaContestacion } = resultado as any;

	const respuestaFormateada = {
		codigoTramite,
		fechaCreado: avo?.fechaCreado || '',
		Canton: can?.canton || '',
		fechaCitacion: citacion?.fecha || '',
		horaCitacion: citacion?.hora || '',
		id: audienciaContestacion?.id || null
	};
	

	return respuestaFormateada;
}

// Servicio para obtener todos los datos relacionados con la audiencia de contestación
export async function obtenerAudienciaContestacionCompleta(idAudiencia: number) {
	// Buscar la audiencia principal
	const audiencia = await AudienciaContestacion.findByPk(idAudiencia);
	if (!audiencia) {
		throw new Error('No existe la audiencia de contestación con el id proporcionado');
	}

	// Buscar la audiencia de pruebas relacionada a la misma denuncia
	const audienciaPruebas = await AudienciaPruebas.findOne({
		where: { idDenuncia: audiencia.idDenuncia },
		attributes: ['id']
	});

	// Buscar el cantón de la audiencia (a través de la denuncia)
	let usuariosPrincipales: any[] = [];
	let nombreCanton = '';
	const denuncia = await Denuncia.findByPk(audiencia.idDenuncia, { attributes: ['id_canton'] });
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
	}
	// Buscar los participantes relacionados
	const participantes = await ParticipantesAudienciaContestacion.findAll({
		where: { idAC: idAudiencia },
		attributes: ['nombres', 'apellidos', 'cedula', 'tipoParticipante', 'asistio', 'justifico', 'manifiesta']
	});

	// Buscar todos los afectados de la denuncia
	const afectados = await Afectado.findAll({
		where: { idDenuncia: audiencia.idDenuncia },
		attributes: ['id', 'nombres', 'apellidos', 'cedula']
	});

	// Buscar todas las medidas emergentes de los afectados
	const medidasEmergentes = await Promise.all(afectados.map(async (a: any) => {
		const medidas = await MedidasEmergentes.findAll({
			where: { idAfectado: a.id },
			include: [{ model: medida, as: 'Med', attributes: ['medidas'] }],
			attributes: ['idMedida', 'periodo', 'observaciones']
		});
		return {
			idAfectado: a.id,
			nombres: a.nombres,
			apellidos: a.apellidos,
			cedula: a.cedula,
			medidas: medidas.map((m: any) => ({
				idMedida: m.idMedida,
				medida: m.Med?.medidas,
				periodo: m.periodo,
				observaciones: m.observaciones
			}))
		};
	}));

	
	  
	// Estructura de respuesta
	return {
		idDenuncia: audiencia.idDenuncia,
		codigoTramite: audiencia.codigoTramite,
		fecha: audiencia.fecha,
		hora: audiencia.hora,
		instalacionAudiencia: audiencia.instalacionAudiencia,
		dirigue: audiencia.dirigue,
		indica: audiencia.indica,
		manifiesta: audiencia.manifiesta,
		seRatifica: audiencia.seRatifica,
		pdf_audiencia_contestacion: audiencia.pdf_audiencia_contestacion,
		afectadoManifiesta: audiencia.afectadoManifiesta,
		canton: nombreCanton,
		participantes: participantes.map(p => ({
			nombres: p.nombres,
			apellidos: p.apellidos,
			cedula: p.cedula,
			tipoParticipante: p.tipoParticipante,
			asistio: p.asistio,
			justifico: p.justifico,
			manifiesta: p.manifiesta
		})),
		medidasEmergentesPorAfectado: medidasEmergentes,
		usuariosPrincipalesCanton: usuariosPrincipales,
		idAudienciaPruebas: audienciaPruebas?.id || null
	};
}

// Servicio para actualizar la audiencia de contestación
export async function actualizarAudienciaContestacion(idAudiencia: number, data: AudienciaContestacionData) {
	console.log("data recibida", data);
	const t = await sequelize.transaction();
	try {
		const audiencia = await AudienciaContestacion.findByPk(idAudiencia);
		if (!audiencia) {
			throw new Error('No existe la audiencia de contestación con el id proporcionado');
		}
		await audiencia.update({
			idDenuncia: data.idDenuncia,
			codigoTramite: data.codigoTramite,
			fecha: data.fecha,
			hora: data.hora,
			instalacionAudiencia: data.instalacionAudiencia,
			dirigue: data.dirigue,
			indica: data.indica,
			afectadoManifiesta: data.afectadoManifiesta,
			manifiesta: data.manifiesta,
			seRatifica: data.seRatifica,
			pdf_audiencia_contestacion: data.pdf_audiencia_contestacion
		}, { transaction: t });

		// Actualizar participantes: eliminar los existentes y crear los nuevos
		await ParticipantesAudienciaContestacion.destroy({ where: { idAC: idAudiencia }, transaction: t });
		if (Array.isArray(data.participantes)) {
			for (const participante of data.participantes) {
				await ParticipantesAudienciaContestacion.create({
					idAC: audiencia.id,
					nombres: participante.nombres,
					apellidos: participante.apellidos,
					cedula: participante.cedula,
					tipoParticipante: participante.tipoParticipante,
					asistio: participante.asistio ?? false,
					justifico: participante.justifico ?? false,
					manifiesta: participante.manifiesta ?? ''
				}, { transaction: t });
			}
		}

		await t.commit();
		return audiencia;
	} catch (error) {
		await t.rollback();
		throw error;
	}
}

//----------------SERVICIO PARA PARTICIPANTES----------------------//

// Obtener los nombres de los afectados y el campo diriguidoA de citaciones para una denuncia
export async function getAfectadosYDirigidoA(idDenuncia: number) {
		const existeCitacion = await Citacion.findOne({ where: { idDenuncia } });
		if (!existeCitacion) {
			const error = new Error("No existe una citación para esta denuncia");
			error.name = "NoExisteCitacion";
			throw error;
		}

		// Traer todas las citaciones asociadas a la denuncia
		const citados = await Citacion.findAll({
			where: {
				idDenuncia,
				parte: { [Op.not]: 'institucion' }
			},
			attributes: ["diriguidoA", "parte", "idUsuario"]
		});
		

		// Preparar ids por tipo
		const idsDenunciante = citados.filter(c => c.parte === 'Accionante').map(c => c.idUsuario);
		const idsDenunciado = citados.filter(c => c.parte === 'Accionado').map(c => c.idUsuario);
		const idsOtros = citados.filter(c => c.parte !== 'institucion' ).map(c => c.idUsuario);

		

		// Batch fetch personas solo por tipo
		const [denunciantes, denunciados, otros, afectados, otrosAudiencia] = await Promise.all([
			idsDenunciante.length > 0
				? Denunciante.findAll({ where: { id: idsDenunciante, idDenuncia:idDenuncia }, attributes: ["id", "nombres", "apellidos", "cedula"] })
				: [],
			idsDenunciado.length > 0
				? Denunciado.findAll({ where: { id: idsDenunciado, idDenuncia:idDenuncia }, attributes: ["id", "nombres", "apellidos", "cedula"] })
				: [],
			idsOtros.length > 0
				? Otros.findAll({ where: { id: idsOtros, idDenuncia:idDenuncia }, attributes: ["id", "nombres", "apellidos", "cedula", "tipoParticipante"] })
				: [],
			Afectado.findAll({ where: { idDenuncia:idDenuncia }, attributes: ["id", "nombres", "apellidos", "cedula"] }),
			Otros.findAll({ where: { idDenuncia:idDenuncia, fase: 'audienciaContestacion' }, attributes: ["nombres", "apellidos", "cedula", "tipoParticipante"] })
		]);
		

		const mapDenunciante = new Map(denunciantes.map(d => [d.id, d]));
		const mapDenunciado = new Map(denunciados.map(d => [d.id, d]));
		const mapOtros = new Map(otros.map(o => [o.id, o]));

		const resultado = [];
		// Agregar todos los afectados aparte, incluyendo sus medidas emergentes
		for (const a of afectados) {
			// Buscar medidas emergentes para el afectado
			const medidas = await MedidasEmergentes.findAll({
				where: { idAfectado: a.id },
				include: [{ model: medida, as: 'Med', attributes: ['medidas'] }],
				attributes: ['idMedida', 'periodo', 'observaciones']
			});
			resultado.push({
				nombres: a.nombres,
				apellidos: a.apellidos,
				cedula: a.cedula,
				tipoParticipante: 'Afectado',
				medidasEmergentes: medidas.map(m => ({
					idMedida: m.idMedida,
					medida: m.Med?.medidas,
					periodo: m.periodo,
					observaciones: m.observaciones
				}))
			});
		}

		for (const citado of citados) {
			let persona = null;
			let tipo = '';
			if (citado.parte === 'Accionante' && mapDenunciante.has(citado.idUsuario)) {
				persona = mapDenunciante.get(citado.idUsuario);
				tipo = 'Denunciante';
			} else if (citado.parte === 'Accionado' && mapDenunciado.has(citado.idUsuario)) {
				persona = mapDenunciado.get(citado.idUsuario);
				tipo = 'Denunciado';
			} else if (mapOtros.has(citado.idUsuario)) {
				persona = mapOtros.get(citado.idUsuario);
				tipo = persona?.tipoParticipante || 'Otro';
			}
			if (persona) {
				resultado.push({
					nombres: persona.nombres,
					apellidos: persona.apellidos,
					cedula: persona.cedula,
					tipoParticipante: tipo
				});
			}
		}
		for (const o of otrosAudiencia) {
			resultado.push({
				nombres: o.nombres,
				apellidos: o.apellidos,
				cedula: o.cedula,
				tipoParticipante: o.tipoParticipante || 'Otro'
			});
		}
		console.log("Resultado participantes:", resultado);

		

		return resultado;




	
}



//servicio para  agregar mas participantes
export async function AgregarOtrosParticipantes(data: any) {
	// params: { nombres, apellidos, cedula, tipoParticipante, idDenuncia }
  const { nombres, apellidos, cedula, tipoParticipante, idDenuncia } = data;
  
  const nuevoParticipante = await Otros.create({
    nombres,
    apellidos,
    cedula,
    tipoParticipante,
    idDenuncia,
	fase: 'audienciaContestacion'
  });
  return nuevoParticipante;
}


