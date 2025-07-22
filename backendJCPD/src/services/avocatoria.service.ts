import { Denuncia, Afectado, Denunciante, Denunciado, Vulneracion, Canton } from "../models";

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
                        model: Vulneracion,
                        as: 'vulneraciones',
                        attributes: ['id', 'vulneracion']
                    }
                ]
            },
            {
                model: Denunciante,
                as: 'denunciante',
                attributes: ['nombres', 'apellidos']
            },
            {
                model: Denunciado,
                as: 'denunciados',
                attributes: ['nombres', 'apellidos']
            }
        ]
    });
    if (!denuncia) {
        throw new Error("Denuncia no encontrada");
    }
    return denuncia;
}