import { Providencias } from "../models/providencia.model";
import { Denuncia, Canton, usuarios } from "../models";
import { RegistrarLoggs } from "./loggs.service";

interface ProvidenciaInput {
    articulos: string;
    suscrito: string;
    nombreSuscrito: string;
    cargoSuscrito?: string;
    fechaSuscrito?: Date;
    institucionSuscrito?: string;
    disposiciones: string;
    codigoTramite: string;
    idDenuncia: number;
    pdf_providencia?: string;
}

interface ProvidenciaOutput {
    id: number;
    articulos: string;
    suscrito: string;
    fechaSuscrito?: Date;
    nombreSuscrito: string;
    cargoSuscrito?: string;
    institucionSuscrito?: string;
    disposiciones: string;
    codigoTramite: string;
    idDenuncia: number;
    pdf_providencia: string;
    fechaCreado?: Date;
    estatus: "pendiente"|"en_proceso"|"completada";
    
}

/**
 * Mapear datos del modelo a formato de salida
 */
function mapearProvidencia(providencia: any) {
    return {
        id: providencia.id,
        articulos: providencia.articulos,
        suscrito: providencia.suscribe,
        fechaSuscrito: providencia.fechaSuscrito,
        nombreSuscrito: providencia.nombreQuienSuscribe,
        cargoSuscrito: providencia.cargoQuienSuscribe,
        institucionSuscrito: providencia.institucionQuienSuscribe,
        disposiciones: providencia.disposiciones,
        codigoTramite: providencia.codigoTramite,
        idDenuncia: providencia.idDenuncia,
        pdf_providencia: providencia.pdf_providencia,
        estatus: providencia.estatus,
        fechaCreado: providencia.fecha_creado
    };
}


export async function crearProvidencia(data: ProvidenciaInput,idUsuario:number,usuario:string,nombres:string,canton:string): Promise<Providencias> {
        try {
            const nuevaProvidencia = await Providencias.create({
                articulos: data.articulos,
                suscribe: data.suscrito,
                fechaSuscrito: data.fechaSuscrito,
                nombreQuienSuscribe: data.nombreSuscrito,
                cargoQuienSuscribe: data.cargoSuscrito,
                institucionQuienSuscribe: data.institucionSuscrito,
                disposiciones: data.disposiciones,
                codigoTramite: data.codigoTramite,
                idDenuncia: data.idDenuncia,
                estatus: 'completada'
            });
            RegistrarLoggs({
                              idUsuario: idUsuario,
                              usuario:usuario ,
                              nombres: nombres,
                              fase:'Providencia',
                              accion:'CREATE' ,
                              descripcion:` ${usuario} acaba de registrar una providencia con  codigo de expediente ${data.codigoTramite}` ,
                              canton:canton
                              
                              });

            return nuevaProvidencia;
        } catch (error: any) {
            throw new Error(`Error al crear la providencia: ${error.message}`);
        }
    }

export async function obtenerDatosProvidenciaCompleta(id: number): Promise<any | null> {
    try {
        const providencia = await Providencias.findByPk(id, {
            include: [
                {
                    model: Denuncia,
                    attributes: ['id_canton'],
                    as: 'denunciaP',
                    include: [
                        {
                            model: Canton,
                            as: 'canton',
                            attributes: ['id', 'canton']
                        }
                    ]
                }
            ]
        });
        
        
        if (!providencia) {
            return null;
        }

        // Obtener usuarios principales activos del cantón
        let usuariosPrincipales: any[] = [];
        let nombreCanton = '';
        const denuncia = (providencia as any).denunciaP;
        
        if (denuncia && denuncia.id_canton) {
            usuariosPrincipales = await usuarios.findAll({
                where: {
                    id_canton: denuncia.id_canton,
                    rol: 'principal',
                    isactivo: true
                },
                attributes: ['id', 'nombres', 'apellidos', 'correo', 'rol', 'id_canton']
            });
            
            nombreCanton = denuncia.canton?.canton || '';
            console.log('Nombre del cantón:', nombreCanton);
        }
        
        return {
            id: providencia.id,
            articulos: providencia.articulos,
            suscrito: providencia.suscribe,
            fechaSuscrito: providencia.fechaSuscrito,
            nombreSuscrito: providencia.nombreQuienSuscribe,
            cargoSuscrito: providencia.cargoQuienSuscribe,
            institucionSuscrito: providencia.institucionQuienSuscribe,
            disposiciones: providencia.disposiciones,
            codigoTramite: providencia.codigoTramite,
            idDenuncia: providencia.idDenuncia,
            pdf_providencia: providencia.pdf_providencia,
            estatus: providencia.estatus,
            fecha_creado: providencia.fecha_creado,
            canton: nombreCanton,
            usuariosPrincipalesCanton: usuariosPrincipales
        };
    } catch (error: any) {
        throw new Error(`Error al obtener la providencia: ${error.message}`);
    }
}


export async function obtenerIdProvidenciaPorDenuncia(idDenuncia: number): Promise<number | null> {
    try {
        const providencia = await Providencias.findOne({
            where: { idDenuncia },
            attributes: ['id']
        });
        
        if (!providencia) {
            return null;
        }
        
        return providencia.id;
    } catch (error: any) {
        throw new Error(`Error al obtener el ID de la providencia: ${error.message}`);
    }
}


export async function actualizarProvidencia(id: number, data: Partial<ProvidenciaInput>,idUsuario:number,usuario:string,nombres:string,canton:string): Promise<ProvidenciaOutput | null> {
    try {
        const providencia = await Providencias.findByPk(id);
        
        
        if (!providencia) {
            return null;
        }

        await providencia.update({
            articulos: data.articulos,
            suscribe: data.suscrito,
            fechaSuscrito: data.fechaSuscrito,
            nombreQuienSuscribe: data.nombreSuscrito,
            cargoQuienSuscribe: data.cargoSuscrito,
            institucionQuienSuscribe: data.institucionSuscrito,
            disposiciones: data.disposiciones,
            pdf_providencia: data.pdf_providencia
        });

        RegistrarLoggs({
                  idUsuario: idUsuario,
                  usuario:usuario ,
                  nombres: nombres,
                  fase:'Providencias',
                  accion:'Update' ,
                  descripcion:` ${usuario} acaba de actualizar la providencia  con  codigo de expediente ${data.codigoTramite}` ,
                  canton:canton
                  
                  });
        
        return mapearProvidencia(providencia);
    } catch (error: any) {
        throw new Error(`Error al actualizar la providencia: ${error.message}`);
    }
}





