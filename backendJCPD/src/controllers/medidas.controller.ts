import { Request, Response } from 'express';
import { medida, articulo } from '../models';
import { agregarMedidasEmergentes, medidasEmergentesPorAfectado, editarMedidaEmergente, eliminarMedidaEmergente, agregarMedidasDefinitivas, editarMedidaDefinitiva, medidasDefinitivasPorAfectado, medidasIdentificadasPorAfectado, eliminarMedidaDefinitivas } from '../services/medidasproteccion.service';
import { handlehttp } from '../utils/error.handle';

// Obtener todas las medidas con sus artículos
export const getAllMedidas = async (req: Request, res: Response) => {
  try {
    const medidas = await medida.findAll({
      include: [{
        model: articulo,
        
        attributes: ['id', 'articulo']
      }],
      order: [
        ['idArticulo', 'ASC'],
        ['medidas', 'ASC']
      ]
    });

    // Mapear medidas a la estructura deseada
    const medidasMapeadas = medidas.map((medida: any) => ({
      id: medida.id,
      medida: medida.medidas,
      cuerpoLegal: medida.articulo.articulo
    }));

    res.json({
      success: true,
      data: medidasMapeadas
    });
  } catch (error) {
    console.error('Error al obtener medidas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las medidas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
//obtener medidas emergentes por afectado
export const getMedidasIdentificadasPorAfectado = async (req: Request, res: Response) => {
	try {
		const id = parseInt(req.params.id);
		  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
		
		  const afectado = await medidasIdentificadasPorAfectado(id);
		 
		
		  res.json({
			afectado
		  });
      
	} catch (error) {
		handlehttp(res,'Error al obtener medidas emergentes por afectado' , error);
	}
};

//obtener medidas emergentes por afectado
export const getMedidasEmergentesPorAfectado = async (req: Request, res: Response) => {
	try {
		const id = parseInt(req.params.id);
		  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
		
		  const afectado = await medidasEmergentesPorAfectado(id);
		 
		
		  res.json({
        afectado
      });
      
	} catch (error) {
		handlehttp(res,'Error al obtener medidas emergentes por afectado' , error);
	}
};

export const postMedidasEmergentes = async (req: Request, res: Response) => {
  try {
    const result = await agregarMedidasEmergentes(req.body);
    res.status(201).json(result);
  } catch (error:any) {
     if ( error.name === "medidaEmergenteDuplicada") {
      return res.status(400).json({ message: error.message });
    }
    handlehttp(res, 'Error al agregar medidas emergentes', error);
  }
};

// Editar medida emergente
export const putEditarMedidaEmergente = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
    const actualizado = await editarMedidaEmergente(id, req.body);
    res.json({ success: true, data: actualizado });
  } catch (error:any) {
    if ( error.name === "medidaEmergenteDuplicada") {
      return res.status(400).json({ message: error.message });
    }
    handlehttp(res, 'Error al editar medida emergente', error);
  }
};

// Eliminar medida emergente
export const deleteMedidaEmergente = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
    const resultado = await eliminarMedidaEmergente(id);
    res.json(resultado);
  } catch (error) {
    handlehttp(res, 'Error al eliminar medida emergente', error);
  }
};

export const getMedidasDefinitivasPorAfectado = async (req: Request, res: Response) => {
	try {
		const id = parseInt(req.params.id);
		  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
		
		  const afectado = await medidasDefinitivasPorAfectado(id);
		 
		
		  res.json({
			afectado
		  });
      
	} catch (error) {
		handlehttp(res,'Error al obtener medidas definitivas por afectado' , error);
	}
};
//agregar medidas definitivas
export const postMedidasDefinitivas = async (req: Request, res: Response) => {
  try {
    const result = await agregarMedidasDefinitivas(req.body);
    res.status(201).json(result);
  } catch (error:any) {
     if ( error.name === "medidaDefinitivasDuplicada") {
      return res.status(400).json({ message: error.message });
    }
    handlehttp(res, 'Error al agregar medidas definitivas', error);
  }
};

//editar medidas definitivas
export const putEditarMedidaDefinitiva = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    console.log("ID a editar:", id);
    if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
    const actualizado = await editarMedidaDefinitiva(id, req.body);
    res.json({ success: true, data: actualizado });
  } catch (error:any) {
    if ( error.name === "medidaDefinitivasDuplicada") {
      return res.status(400).json({ message: error.message });
    }
    handlehttp(res, 'Error al editar medida definitiva', error);
  }
};

// Eliminar medida definitiva
export const deleteMedidaDefinitiva = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
    const resultado = await eliminarMedidaDefinitivas(id);
    res.json(resultado);
  } catch (error) {
    handlehttp(res, 'Error al eliminar medida definitiva', error);
  }
};
