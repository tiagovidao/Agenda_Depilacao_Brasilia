import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const appointmentValidation = [
  body('times').isArray().notEmpty().withMessage('Horários são obrigatórios'),
  body('type').isIn(['Laser', 'Cera']).withMessage('Tipo inválido'),
  body('client_name').notEmpty().withMessage('Nome do cliente é obrigatório'),
  body('value').isNumeric().optional(),
  body('date').isISO8601().withMessage('Data inválida'),
  validate
];

export const loginValidation = [
  body('usernameOrEmail').notEmpty().withMessage('Usuário ou email obrigatório'),
  body('password').notEmpty().withMessage('Senha obrigatória'),
  validate
];

export const registerValidation = [
  body('name').notEmpty().withMessage('Nome obrigatório'),
  body('username').isLength({ min: 3 }).withMessage('Usuário mínimo 3 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha mínimo 6 caracteres'),
  validate
];