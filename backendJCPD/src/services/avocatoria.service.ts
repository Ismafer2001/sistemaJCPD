import { Model, Transaction } from "sequelize";
import { avocatoriaDTO } from "../interfaces/avocatoria.interface";
import { Denuncia, Afectado, Denunciante, Denunciado, Vulneracion, Canton, Avocatoria, VulneracionesIdentificadas, medida } from "../models";
import sequelize from "../config/database";
// Servicio para crear una avocatoria
export async function crearAvocatoria(data:avocatoriaDTO) {
    const existe = await Avocatoria.findOne({ where: { idDenuncia: data.idDenuncia} });
        if (existe) {
          throw new Error("avocatoria ya existe");
        }
        const t: Transaction = await sequelize.transaction(); //iniciallizams transaccion
        try {
            
        } catch (error) {
            
        }


  // Puedes ajustar los campos según tu modelo Avocatoria
  
  return  Avocatoria.create({
    fechaCreado: data.fechaCreado,
  horaCreado:data.horaCreado,
  codigoTramite: data.codigoTramite,
  disposiciones:data.disposiciones,
  idDenuncia:data.idDenuncia,
    
  });
}

export async function obtenerDenunciaParaAvocatoria(id: string) {
    const denuncia = await Denuncia.findByPk(id, {
        attributes: [
            'id',
            'fecha_creado',
            'descripcion_hechos',
            'codigoTramite'
        ],
        include: [
            {
                model: Canton,
                attributes: ['canton'],
            },
            {
                model: Afectado,
                as: 'afectados',
                attributes: ['nombres', 'apellidos', 'edad'],
                include: [
                    {
                        model: VulneracionesIdentificadas,
                        as:'vulneracionesI',
                        
                        attributes: ['idAfectado', 'idVulneracion'],
                        include:[
                            {
                                model: Vulneracion,
                                attributes:['vulneracion']

                            }
                        ]
                    }
                ]
            },
            {
                model: Denunciante,
                
                attributes: ['nombres', 'apellidos']
            },
            {
                model: Denunciado,
                
                attributes: ['nombres', 'apellidos']
            }
        ]
    });
    if (!denuncia) {
        throw new Error("Denuncia no encontrada");
    }
    return denuncia;
}


