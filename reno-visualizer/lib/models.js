import fs from "fs";
import path from "path";

const MODELS_DIR = path.join(process.cwd(), "public", "models");

// Ensure the models directory exists
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

/**
 * Check if a model exists
 * @param {string} modelName
 * @returns {boolean}
 */
export function modelExists(modelName) {
  const filePath = path.join(MODELS_DIR, modelName);
  return fs.existsSync(filePath);
}

/**
 * Save a model to disk
 * @param {string} modelName
 * @param {Buffer} modelData
 * @returns {string} URL to the saved model
 */
export function saveModel(modelName, modelData) {
  const filePath = path.join(MODELS_DIR, modelName);
  fs.writeFileSync(filePath, modelData);
  return `/models/${modelName}`;
}

/**
 * Load a model from disk
 * @param {string} modelName
 * @returns {Buffer|null}
 */
export function loadModel(modelName) {
  const filePath = path.join(MODELS_DIR, modelName);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath);
}
