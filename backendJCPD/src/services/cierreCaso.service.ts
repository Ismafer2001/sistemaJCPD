import { CierreCaso, InformesPresentados, Denuncia, Afectado, CumpleMedidas, InformeAnexado } from "../models";
import sequelize from "../config/database";

interface InformeData {
    informe: string;
    nombreTecnico: string;
    lugar: string;
    personaEvaluada: string;
}

interface CierreCasoData {
    idDenuncia: number;
    codigoTramite: string;
    conclusion: string;
    secretariaAuxiliar: string;
    informesPresentados: InformeData[];
    estatus?: "pendiente"|"en_proceso"|"completada";
}

export async function crearCierreCaso(data: CierreCasoData) {
    const transaction = await sequelize.transaction();
    
    try {
        // 1. Crear el registro de cierre de caso
        const cierreCaso = await CierreCaso.create({
            idDenuncia: data.idDenuncia,
            codigoTramite: data.codigoTramite,
            conclusion: data.conclusion,
            secretariaAuxiliar: data.secretariaAuxiliar,
            estatus:"completada"
        }, { transaction });

        // 2. Crear los informes presentados usando el ID del cierre de caso
        if (data.informesPresentados && data.informesPresentados.length > 0) {
            const informesData = data.informesPresentados.map(informe => ({
                idCierraCaso: cierreCaso.id,
                informe: informe.informe,
                nombreTecnico: informe.nombreTecnico,
                lugar: informe.lugar,
                personaEvaluada: informe.personaEvaluada
            }));

            await InformesPresentados.bulkCreate(informesData, { transaction });
        }

        // Confirmar la transacción
        await transaction.commit();

        // Retornar el cierre de caso creado con los informes
        const cierreCasoCompleto = await CierreCaso.findByPk(cierreCaso.id, {
            include: [
                {
                    model: InformesPresentados,
                    as: 'InformesPresentados'
                }
            ]
        });

        return cierreCasoCompleto;

    } catch (error) {
        // Revertir la transacción en caso de error
        await transaction.rollback();
        throw error;
    }
}

export async function obtenerDatosParaCierreCaso(idDenuncia: number) {
    try {
        // Obtener los datos de la denuncia con sus informes anexados
        const denuncia = await Denuncia.findByPk(idDenuncia, {
            attributes: ['id', 'codigoTramite'],
            include: [
                {
                    model: Afectado,
                    as: 'afectados',
                    include: [
                        {
                            model: CumpleMedidas,
                            as: 'cumpleM',
                            include: [
                                {
                                    model: InformeAnexado,
                                    as: 'InformeAnexado',
                                    attributes: ['fileName']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!denuncia) {
            throw new Error(`No se encontró la denuncia con ID: ${idDenuncia}`);
        }

        // Extraer todos los filenames de los informes anexados
        const filenames: string[] = [];
        if (denuncia.afectados) {
            denuncia.afectados.forEach((afectado: any) => {
                if (afectado.cumpleM) {
                    afectado.cumpleM.forEach((cumple: any) => {
                        if (cumple.InformeAnexado && cumple.InformeAnexado.fileName) {
                            filenames.push(cumple.InformeAnexado.fileName);
                        }
                    });
                }
            });
        }

        return {
            codigoTramiteDenuncia: denuncia.codigoTramite,
            informesAnexados: filenames
        };

    } catch (error) {
        throw error;
    }
}