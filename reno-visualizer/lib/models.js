import fs from "fs";
import path from "path";

const MODELS_DIR = path.join(process.cwd(), "models");

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
  const filePath = path.join(MODELS_DIR, `${modelName}.json`);
  return fs.existsSync(filePath);
}

/**
 * Save a model to disk
 * @param {string} modelName
 * @param {object} modelData
 */
export function saveModel(modelName, modelData) {
  const filePath = path.join(MODELS_DIR, `${modelName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(modelData, null, 2), "utf-8");
}

/**
 * Load a model from disk
 * @param {string} modelName
 * @returns {object|null}
 */
export function loadModel(modelName) {
  const filePath = path.join(MODELS_DIR, `${modelName}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}
