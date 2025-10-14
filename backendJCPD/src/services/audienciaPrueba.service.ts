
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
	MedidasEmergentes,
	medida,
	VulneracionesIdentificadas,
	Vulneracion,
	Testimonio } from "../models";

interface ParticipanteData {
	nombres: string;
	apellidos: string;
	cedula: string;
	tipoParticipante: string;
	asistio?: string;
	pruebas?: string;
	testimonio?: string;
	parte: string;
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
	participantes: ParticipanteData[];
	medidasDefinitivas: medidaDefinitivaData[];
	estatus: "pendiente"|"en_proceso"|"completada";
}

//--- SERVICIOS PARA AUDIENCIA DE PRUEBAS ---//
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
			estatus:  'completada',
		}, { transaction: t });
		// Crear medidas emergentes asociadas en la tabla medidas_emergentes
			for (const medida of data.medidasDefinitivas) {
			  console.log("Medida definitivas a crear:", data);
			  if (!medida || medida.idMedida == null || medida.idAfectado == null) {
			// Puedes lanzar un error o simplemente continuar
			throw new Error("Medida definitivas inválida: falta idMedida o idAfectado");
		  }
			  await MedidasDefinitivas.create({
				idMedida: medida.idMedida,
				idAfectado: medida.idAfectado,
				idAP: audiencia.id,
				periodo: medida.periodo,
				observaciones: medida.observaciones,
				// Cambia este campo si tu modelo usa otro nombre
			  }, { transaction: t });
			}

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
		await ParticipantesAudienciaPruebas.destroy({ where: { idAP: idAudiencia }, transaction: t });
		if (Array.isArray(data.participantes)) {
			for (const participante of data.participantes) {
				await ParticipantesAudienciaPruebas.create({
					idAP: audiencia.id,
					nombres: participante.nombres,
                    apellidos: participante.apellidos,
					cedula: participante.cedula,
					tipoParticipante: participante.tipoParticipante,
					parte: participante.parte ?? '',
					
					pruebas: participante.pruebas ?? ''
				}, { transaction: t });
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
				model: Canton,
				attributes: ['canton'],
				as: "canton"
			},
			
		]
	});

	

	const { codigoTramite,  canton: can } = resultado as any;

	const respuestaFormateada = {
		codigoTramite,
		
		Canton: can?.canton || '',

	};
	console.log(respuestaFormateada);

	return respuestaFormateada;
}
//servicio para obtener los afectados de una denuncia seleccionada
export async function obtenerAfectados(id: number) { //---> se repite en audiencia de pruebas

  return await Afectado.findAll({
	where: { idDenuncia: id },
	attributes: ['id', 'nombres'],
  });
};
//servicio para obtener las medidas identificadas en la fase de denuncia de un afectado seleccionado    
export const medidasEmergentesPorAfectado = async (afectadoId: number) => {
  const afectado = await Afectado.findByPk(afectadoId, {
	attributes: ['id', 'nombres'],
	include: [
	  {
		model: MedidasEmergentes,
		as: "medidasE",
		attributes: ['idMedida','observaciones','periodo'],
		include: [
		  {
			model: medida,
			as: 'Med', // ← importante: debe coincidir con el modelo
			attributes: ['medidas'],
		  },
		],
	  },
	],
  });

  if (!afectado){
	console.log("No se encontró el afectado con ID:", afectadoId);
	 return [];

  }
  console.log("Afectado encontrado:", afectado.toJSON());

  const resultadoFormateado = [];

  for (const mi of afectado.medidasE || []) {
	
   
	if (mi.Med?.medidas) {
	  resultadoFormateado.push({
		idMedida: mi.idMedida,
		idAfectado: afectado.id,
		nombres: afectado.nombres,
		medida: mi.Med.medidas,
		periodo: mi.periodo,
		observaciones: mi.observaciones
	  });
	}
  }
  console.log("Medidas Emergentes:", resultadoFormateado);
  return resultadoFormateado;
};


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
