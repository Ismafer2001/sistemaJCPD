import sequelize from "../config/database";
import { Desestimiento } from "../models/desestimiento.models";
import { Denuncia, Canton } from "../models";
import { RegistrarLoggs } from "./loggs.service";

export interface DesestimientoDTO {
  idDenuncia: number;
  codigoTramite: string;
  resultado_desestimiento: string;
  estatus?: "pendiente" | "en_proceso" | "completada";
}

//servicio para crear desestimiento
export async function crearDesestimiento(data: DesestimientoDTO,idUsuario:number,usuario:string,nombres:string,canton:string) {
  const t = await sequelize.transaction();
  try {
    // Verificar que existe la denuncia
    const existeDenuncia = await Denuncia.findByPk(data.idDenuncia);
    
    if (!existeDenuncia) {
      const error = new Error("No existe una denuncia con el id proporcionado");
      error.name = "DenunciaNoEncontrada";
      throw error;
    }

    // Verificar que no existe ya un desestimiento para esta denuncia
    const existeDesestimiento = await Desestimiento.findOne({ 
      where: { idDenuncia: data.idDenuncia } 
    });

    if (existeDesestimiento) {
      const error = new Error("Ya existe un desestimiento para esta denuncia");
      error.name = "DesestimientoExistente";
      throw error;
    }

    const desestimiento = await Desestimiento.create({
      idDenuncia: data.idDenuncia,
      codigoTramite: data.codigoTramite,
      resultado_desestimiento: data.resultado_desestimiento,
      estatus: data.estatus || 'completada'
    }, { transaction: t });
    RegistrarLoggs({
                         idUsuario: idUsuario,
                         usuario:usuario ,
                         nombres: nombres,
                        fase:'Desestimiento',
                         accion:'CREATE' ,
                         descripcion:` ${usuario} acaba de regisrar un desestimiento como${data.resultado_desestimiento} relacionado al codigo de expediente ${data.codigoTramite}` ,
                         canton:canton
                                                    
                                                  });

    await t.commit();
    return desestimiento;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
// Servicio para obtener el código de trámite de una denuncia específica
export async function obtenerCodigoTramiteDenunciaDes(id: number) {
  try {
    const denuncia = await Denuncia.findByPk(id, {
      attributes: ['id','codigoTramite'],

      
    });

    const desestimiento = await Desestimiento.findOne({
      where:{idDenuncia:id},
      attributes:['id']
    })
    

    if (!denuncia) {
      throw new Error('Denuncia no encontrada');
    }

    const denunciaData = denuncia as any;
    const idDestimiento = desestimiento as any;
    
    
   

    return {
      idDenuncia: denunciaData.id,
      codigoTramite: denunciaData.codigoTramite,
      idDesestimiento:idDestimiento.id
    };

  } catch (error) {
    throw error;
  }
}



//servicio para obtener un desestimiento por id
export async function obtenerDesestimientoPorId(id: number) {
  const desestimiento = await Desestimiento.findByPk(id, {
    include: [
      {
        model: Denuncia,
        as:'DenunciaDes',
        attributes: ['codigoTramite'],
        include: [
          {
            model: Canton,
            as: 'canton',
            attributes: ['canton']
          }
        ]
      }
    ]
  });
  console.log(desestimiento)

  if (!desestimiento) {
    const error = new Error("No se encontró el desestimiento con el id proporcionado");
    error.name = "DesestimientoNoEncontrado";
    throw error;
  }

  return {
    id: desestimiento.id,
    idDenuncia: desestimiento.idDenuncia,
    codigoTramite: desestimiento.codigoTramite,
    resultado_desestimiento: desestimiento.resultado_desestimiento,
    estatus: desestimiento.estatus,
    fechaCreado: (desestimiento as any).fechaCreado,
    fechaActualizado: (desestimiento as any).fechaActualizado,
    denuncia: {
      codigoTramite: (desestimiento as any).DenunciaDes?.codigoTramite || '',
      canton: (desestimiento as any).DenunciaDes?.canton?.canton || ''
    }
  };
}



//servicio para actualizar desestimiento
export async function actualizarDesestimiento(id: number, data: Partial<DesestimientoDTO>,idUsuario:number,usuario:string,nombres:string,canton:string) {
  const t = await sequelize.transaction();
  try {
    const desestimiento = await Desestimiento.findByPk(id);
    
    if (!desestimiento) {
      const error = new Error("No se encontró el desestimiento con el id proporcionado");
      error.name = "DesestimientoNoEncontrado";
      throw error;
    }

    // Si se está cambiando la denuncia, verificar que existe
    if (data.idDenuncia && data.idDenuncia !== desestimiento.idDenuncia) {
      const existeDenuncia = await Denuncia.findByPk(data.idDenuncia);
      if (!existeDenuncia) {
        const error = new Error("No existe una denuncia con el id proporcionado");
        error.name = "DenunciaNoEncontrada";
        throw error;
      }
    }

    await desestimiento.update({
      ...(data.idDenuncia && { idDenuncia: data.idDenuncia }),
      ...(data.codigoTramite && { codigoTramite: data.codigoTramite }),
      ...(data.resultado_desestimiento && { resultado_desestimiento: data.resultado_desestimiento }),
      ...(data.estatus && { estatus: data.estatus })
    }, { transaction: t });
    
RegistrarLoggs({
                         idUsuario: idUsuario,
                         usuario:usuario ,
                         nombres: nombres,
                        fase:'Desestimiento',
                         accion:'UPDATE' ,
                         descripcion:` ${usuario} acaba de actualizar el desestimiento como${data.resultado_desestimiento} relacionado al codigo de expediente ${data.codigoTramite}` ,
                         canton:canton
                                                    
                                                  });
    await t.commit();
    return desestimiento;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

