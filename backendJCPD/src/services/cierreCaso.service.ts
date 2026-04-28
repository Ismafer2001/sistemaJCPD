import { CierreCaso, InformesPresentados, Denuncia, Afectado, CumpleMedidas, InformeAnexado, Canton, usuarios } from "../models";
import sequelize from "../config/database";
import { RegistrarLoggs } from "./loggs.service";

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

export async function crearCierreCaso(data: CierreCasoData,idUsuario:number,usuario:string,nombres:string,canton:string) {
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

        await Denuncia.update({estado:"finalizada"},{where:{id:data.idDenuncia}})
       

        // Retornar el cierre de caso creado con los informes
        const cierreCasoCompleto = await CierreCaso.findByPk(cierreCaso.id, {
            include: [
                {
                    model: InformesPresentados,
                    as: 'informesPresentados'
                }
            ]
        });
        RegistrarLoggs({
                                        idUsuario: idUsuario,
                                        usuario:usuario ,
                                        nombres: nombres,
                                        fase:'Cierre de caso',
                                        accion:'CREATE' ,
                                        descripcion:` ${usuario} acaba de registrar el cierre de caso con  codigo de expediente ${data.codigoTramite}` ,
                                        canton:canton
                                        
                                      });
         await transaction.commit();

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

        // Buscar si ya existe un cierre de caso para esta denuncia
        const cierreCasoExistente = await CierreCaso.findOne({
            where: { idDenuncia: idDenuncia },
            attributes: ['id']
        });

        // Extraer todos los filenames de los informes anexados (sin duplicados)
        const filenamesSet = new Set<string>();
        if (denuncia.afectados) {
            denuncia.afectados.forEach((afectado: any) => {
                if (afectado.cumpleM) {
                    afectado.cumpleM.forEach((cumple: any) => {
                        if (cumple.InformeAnexado && cumple.InformeAnexado.fileName) {
                            filenamesSet.add(cumple.InformeAnexado.fileName);
                        }
                    });
                }
            });
        }
        const filenames = Array.from(filenamesSet);

        const resultado: any = {
            codigoTramiteDenuncia: denuncia.codigoTramite,
            informesAnexados: filenames
        };

        // Si existe un cierre de caso, agregar el id
        if (cierreCasoExistente) {
            resultado.id = cierreCasoExistente.id;
        }

        return resultado;

    } catch (error) {
        throw error;
    }
}

export async function actualizarCierreCaso(idCierreCaso: number, data: CierreCasoData,idUsuario:number,usuario:string,nombres:string,canton:string) {
    const transaction = await sequelize.transaction();
    
    try {
        // 1. Verificar que el cierre de caso existe
        const cierreCasoExistente = await CierreCaso.findByPk(idCierreCaso);
        if (!cierreCasoExistente) {
            throw new Error(`No se encontró el cierre de caso con ID: ${idCierreCaso}`);
        }

        // 2. Actualizar los datos del cierre de caso
        await CierreCaso.update({
            codigoTramite: data.codigoTramite,
            conclusion: data.conclusion,
            secretariaAuxiliar: data.secretariaAuxiliar,
            estatus: data.estatus || "completada"
        }, {
            where: { id: idCierreCaso },
            transaction
        });

        // 3. Eliminar los informes presentados existentes
        await InformesPresentados.destroy({
            where: { idCierraCaso: idCierreCaso },
            transaction
        });

        // 4. Crear los nuevos informes presentados
        if (data.informesPresentados && data.informesPresentados.length > 0) {
            const informesData = data.informesPresentados.map(informe => ({
                idCierraCaso: idCierreCaso,
                informe: informe.informe,
                nombreTecnico: informe.nombreTecnico,
                lugar: informe.lugar,
                personaEvaluada: informe.personaEvaluada
            }));

            await InformesPresentados.bulkCreate(informesData, { transaction });
        }

        

        // Retornar el cierre de caso actualizado con los informes
        const cierreCasoActualizado = await CierreCaso.findByPk(idCierreCaso, {
            include: [
                {
                    model: InformesPresentados,
                    as: 'informesPresentados'
                }
            ]
        });

        RegistrarLoggs({
                                        idUsuario: idUsuario,
                                        usuario:usuario ,
                                        nombres: nombres,
                                        fase:'Cierre de caso',
                                        accion:'UPDATE' ,
                                        descripcion:` ${usuario} acaba de actualizar el cierre de caso con  codigo de expediente ${data.codigoTramite}` ,
                                        canton:canton
                                        
                                      });
        // Confirmar la transacción
        await transaction.commit();

        return cierreCasoActualizado;

    } catch (error) {
        // Revertir la transacción en caso de error
        await transaction.rollback();
        throw error;
    }
}

export async function obtenerDatosCierreCasoCompleto(idCierreCaso: number) {
    try {
        // Obtener cierre de caso con datos básicos
        const cierreCaso = await CierreCaso.findByPk(idCierreCaso, {
            include: [
                {
                    model: InformesPresentados,
                    as: 'informesPresentados'
                },
                {
                    model: Denuncia,
                    as: 'DenunciaCierre',
                    include: [
                        {
                            model: Canton,
                            as: 'canton'
                        }
                    ]
                }
            ]
        });

        if (!cierreCaso) {
            throw new Error(`No se encontró el cierre de caso con ID: ${idCierreCaso}`);
        }

        // Obtener usuarios principales del cantón de forma separada y más eficiente
        let usuariosPrincipales: any[] = [];
        if (cierreCaso.DenunciaCierre?.canton?.id) {
            usuariosPrincipales = await usuarios.findAll({
                where: { 
                    id_canton: cierreCaso.DenunciaCierre.canton.id,
                    rol: 'principal',
                    isactivo: true
                },
                attributes: ['id', 'nombres', 'apellidos', 'correo', 'usuario']
            });
        }

        // Estructurar la respuesta como JSON
        const resultado = {
            cierreCaso: {
                id: cierreCaso.id,
                idDenuncia: cierreCaso.idDenuncia,
                codigoTramite: cierreCaso.codigoTramite,
                conclusion: cierreCaso.conclusion,
                secretariaAuxiliar: cierreCaso.secretariaAuxiliar,
                estatus: cierreCaso.estatus
            },
            informesPresentados: cierreCaso.informesPresentados || [],
            canton: cierreCaso.DenunciaCierre?.canton || null,
            usuariosPrincipales: usuariosPrincipales
        };

        return resultado;
    } catch (error) {
        throw error;
    }
}
