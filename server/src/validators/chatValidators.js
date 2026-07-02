import { body, param, query } from "express-validator";


export const createOrGetChatValidator = [
  body("targetUserId")
    .notEmpty()
    .withMessage("targetUserId is required")
    .isInt()
    .withMessage("targetUserId must be a valid integer ID"),
];


export const getMessagesValidator = [
  param("chatId")
    .isInt()
    .withMessage("chatId must be a valid integer ID"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
];


export const sendMessageValidator = [
  body("chatId")
    .notEmpty()
    .withMessage("chatId is required")
    .isInt()
    .withMessage("chatId must be a valid integer ID"),
  body("text")
    .notEmpty()
    .withMessage("Message text is required")
    .isString()
    .withMessage("Message text must be a string")
    .isLength({ max: 2000 })
    .withMessage("Message cannot exceed 2000 characters"),
];


export const markReadValidator = [
  param("id")
    .isInt()
    .withMessage("Message ID must be a valid integer ID"),
];


export const deleteMessageValidator = [
  param("id")
    .isInt()
    .withMessage("Message ID must be a valid integer ID"),
];
