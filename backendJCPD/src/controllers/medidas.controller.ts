import { Request, Response } from 'express';
import { medida, articulo } from '../models';
import { agregarMedidasEmergentes, medidasEmergentesPorAfectado, editarMedidaEmergente, eliminarMedidaEmergente, agregarMedidasDefinitivas, editarMedidaDefinitiva, medidasDefinitivasPorAfectado } from '../services/medidasproteccion.service';
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

    // Agrupar medidas por artículo
    const medidasPorArticulo = medidas.reduce((acc: any, medida: any) => {
      const articuloId = medida.idArticulo;
      if (!acc[articuloId]) {
        acc[articuloId] = {
          id: medida.articulo.id,
          articulo: medida.articulo.articulo,
          medidas: []
        };
      }
      acc[articuloId].medidas.push({
        id: medida.id,
        medida: medida.medidas
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: Object.values(medidasPorArticulo)
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
