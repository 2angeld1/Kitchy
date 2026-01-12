import { Request, Response } from 'express';
import Role from '../models/Role';

export const getRoles = async (req: Request, res: Response) => {
    try {
        const roles = await Role.find({});
        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Error al obtener roles' });
    }
};

export const createRole = async (req: Request, res: Response) => {
    try {
        const { name, description, permissions } = req.body;
        
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: 'El rol ya existe' });
        }

        const role = new Role({
            name,
            description,
            permissions
        });

        await role.save();
        res.status(201).json(role);
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ message: 'Error al crear rol' });
    }
};

export const updateRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const role = await Role.findByIdAndUpdate(id, data, { new: true });
        
        if (!role) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        res.json(role);
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ message: 'Error al actualizar rol' });
    }
};

export const deleteRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const role = await Role.findByIdAndDelete(id);
        
        if (!role) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        res.json({ message: 'Rol eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ message: 'Error al eliminar rol' });
    }
};
