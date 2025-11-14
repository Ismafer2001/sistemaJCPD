import { Afectado,
         medida,
         MedidasDefinitivas,
         MedidasEmergentes } from "../models";
import { Op } from 'sequelize';

//servicio para obtener las medidas identificadas en la fase de denuncia de un afectado seleccionado    
export const medidasEmergentesPorAfectado = async (afectadoId: number) => {
  const afectado = await Afectado.findByPk(afectadoId, {
    attributes: ['id', 'nombres'],
    include: [
      {
        model: MedidasEmergentes,
        as: "medidasE",
        attributes: ['id','idMedida','observaciones','periodo'],
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
        id: mi.id,
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

export async function agregarMedidasEmergentes(data: {
    idAfectado: number;
    idMedida: number;
    idAvocatoria: number;
    periodo: string;
    observaciones: string;
}) {
    // Validar datos mínimos
    if (!data.idAfectado || !data. idMedida || !data.idAvocatoria) {
        throw new Error("Faltan datos obligatorios: idAfectado o idVulneracion");
    }

  // Validar que no exista la misma medida para el mismo afectado
  const existente = await MedidasEmergentes.findOne({
    where: {
      idAfectado: data.idAfectado,
      idMedida: data.idMedida
    }
  });
  if (existente) {
    const error = new Error('Ya agregaste esta medida para este afectado');
    error.name = "medidaEmergenteDuplicada";
    throw error;
    
  }

  // Crear la medida emergente
  const nuevaVulneracion = await MedidasEmergentes.create({
    idAfectado: data.idAfectado,
    idMedida: data.idMedida,
    idAvocatoria: data.idAvocatoria,
    periodo: data.periodo,
    observaciones: data.observaciones
  });

  return nuevaVulneracion;
}

// Editar una medida emergente por ID
export async function editarMedidaEmergente(id: number, data: {
  idAfectado?: number;
  idMedida?: number;
  idAvocatoria?: number;
  periodo?: string;
  observaciones?: string;
  
}) {
  const registro = await MedidasEmergentes.findByPk(id);
  if (!registro) throw new Error('Medida emergente no encontrada');

  const camposActualizar: any = {};
  if (data.idAfectado !== undefined) camposActualizar.idAfectado = data.idAfectado;
  if (data.idMedida !== undefined) camposActualizar.idMedida = data.idMedida;
  if (data.idAvocatoria !== undefined) camposActualizar.idAvocatoria = data.idAvocatoria;
  if (data.periodo !== undefined) camposActualizar.periodo = data.periodo;
  if (data.observaciones !== undefined) camposActualizar.observaciones = data.observaciones;

  // Si se modifica afectado o medida, validar duplicado
  const nuevoIdAfectado = camposActualizar.idAfectado ?? registro.idAfectado;
  const nuevoIdMedida = camposActualizar.idMedida ?? registro.idMedida;
  if (nuevoIdAfectado && nuevoIdMedida) {
    const otro = await MedidasEmergentes.findOne({
      where: {
        idAfectado: nuevoIdAfectado,
        idMedida: nuevoIdMedida,
        // excluir el propio registro
        id: { [Op.ne]: registro.id }
      }
    });
    if (otro) {
      const error = new Error('Ya agregaste esta medida para este afectado');
    error.name = "medidaEmergenteDuplicada";
    throw error;
    };
  }

  await registro.update(camposActualizar);
  return registro;
}

// Eliminar una medida emergente por ID
export async function eliminarMedidaEmergente(id: number) {
  const registro = await MedidasEmergentes.findByPk(id);
  if (!registro) throw new Error('Medida emergente no encontrada');
  await registro.destroy();
  return { success: true, message: 'Medida emergente eliminada' };
}

//servicio para obtener las medidas definitivas en la fase de denuncia de un afectado seleccionado    
export const medidasDefinitivasPorAfectado = async (afectadoId: number) => {
  const afectado = await Afectado.findByPk(afectadoId, {
    attributes: ['id', 'nombres'],
    include: [
      {
        model: MedidasDefinitivas,
        as: "medidasD",
        attributes: ['id','idMedida','observaciones','periodo'],
        include: [
          {
            model: medida,
            as: 'MedidasD', // ← importante: debe coincidir con el modelo
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

  for (const mi of afectado.medidasD || []) {

    if (mi.MedidasD?.medidas) {
      resultadoFormateado.push({
        id: mi.id,
        idMedida: mi.idMedida,
        idAfectado: afectado.id,
        nombres: afectado.nombres,
        medida: mi.MedidasD.medidas,
        periodo: mi.periodo,
        observaciones: mi.observaciones
      });
    }
  }
  console.log("Medidas definitivas:", resultadoFormateado);
  return resultadoFormateado;
};

export async function agregarMedidasDefinitivas(data: {
    idAfectado: number;
    idMedida: number;
    idAP: number;
    periodo: string;
    observaciones: string;
}) {
    // Validar datos mínimos
    if (!data.idAfectado || !data. idMedida || !data.idAP) {
        throw new Error("Faltan datos obligatorios: idAfectado o idVulneracion");
    }

  // Validar que no exista la misma medida para el mismo afectado
  const existente = await MedidasDefinitivas.findOne({
    where: {
      idAfectado: data.idAfectado,
      idMedida: data.idMedida
    }
  });
  if (existente) {
    const error = new Error('Ya agregaste esta medida para este afectado');
    error.name = "medidaDefinitivasDuplicada";
    throw error;
    
  }

  // Crear la medida emergente
  const nuevaVulneracion = await MedidasDefinitivas.create({
    idAfectado: data.idAfectado,
    idMedida: data.idMedida,
    idAP: data.idAP,
    periodo: data.periodo,
    observaciones: data.observaciones
  });

  return nuevaVulneracion;
}

// Editar una medida definitiva por ID
export async function editarMedidaDefinitiva(id: number, data: {
  idAfectado?: number;
  idMedida?: number;
  idAP?: number;
  periodo?: string;
  observaciones?: string;
  
}) {
  const registro = await MedidasDefinitivas.findByPk(id);
  if (!registro) throw new Error('Medida definitiva no encontrada');

  const camposActualizar: any = {};
  if (data.idAfectado !== undefined) camposActualizar.idAfectado = data.idAfectado;
  if (data.idMedida !== undefined) camposActualizar.idMedida = data.idMedida;
  if (data.idAP !== undefined) camposActualizar.idAP = data.idAP;
  if (data.periodo !== undefined) camposActualizar.periodo = data.periodo;
  if (data.observaciones !== undefined) camposActualizar.observaciones = data.observaciones;

  // Si se modifica afectado o medida, validar duplicado
  const nuevoIdAfectado = camposActualizar.idAfectado ?? registro.idAfectado;
  const nuevoIdMedida = camposActualizar.idMedida ?? registro.idMedida;
  if (nuevoIdAfectado && nuevoIdMedida) {
    const otro = await MedidasDefinitivas.findOne({
      where: {
        idAfectado: nuevoIdAfectado,
        idMedida: nuevoIdMedida,
        // excluir el propio registro
        id: { [Op.ne]: registro.id }
      }
    });
    if (otro) {
      const error = new Error('Ya agregaste esta medida para este afectado');
    error.name = "medidaEmergenteDuplicada";
    throw error;
    };
  }

  await registro.update(camposActualizar);
  return registro;
}