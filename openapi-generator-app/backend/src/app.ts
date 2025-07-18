import archiver from 'archiver';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar multer para la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.json', '.yaml', '.yml'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos .json, .yaml o .yml'));
    }
  },
});

app.use(bodyParser.json());

// Configurar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization,X-Requested-With'
  );
  res.header('Access-Control-Max-Age', '86400');

  // Manejar solicitudes preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

app.get('/', (req, res) => {
  res.send('Welcome to the OpenAPI Generator App!');
});

// Endpoint para generar código desde URL
app.post('/api/generate', (req, res) => {
  const { openapiUrl, generatorName, outputDir, additionalProperties } =
    req.body;
  if (!openapiUrl || !generatorName || !outputDir) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
  }

  // Construir el comando
  let cmd = `openapi-generator-cli generate -i "${openapiUrl}" -g "${generatorName}" -o "${outputDir}"`;
  if (additionalProperties) {
    cmd += ` --additional-properties="${additionalProperties}"`;
  }

  // Ejecutar el comando
  exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      return res
        .status(500)
        .json({ error: stderr || error.message, output: stdout });
    }
    res.json({ output: stdout });
  });
});

// Endpoint para generar código desde archivo
app.post(
  '/api/generate-from-file',
  upload.single('openapiFile'),
  (req, res) => {
    const { generatorName, outputDir, additionalProperties } = req.body;

    if (!req.file || !generatorName || !outputDir) {
      return res
        .status(400)
        .json({ error: 'Faltan parámetros requeridos o archivo.' });
    }

    const filePath = req.file.path;

    // Construir el comando usando el archivo cargado
    let cmd = `openapi-generator-cli generate -i "${filePath}" -g "${generatorName}" -o "${outputDir}"`;
    if (additionalProperties) {
      cmd += ` --additional-properties="${additionalProperties}"`;
    }

    // Ejecutar el comando
    exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
      // Limpiar el archivo temporal después de usar
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn('No se pudo eliminar el archivo temporal:', cleanupError);
      }

      if (error) {
        return res
          .status(500)
          .json({ error: stderr || error.message, output: stdout });
      }
      res.json({ output: stdout });
    });
  }
);

// Endpoint para descargar archivos generados como ZIP
app.post('/api/download', (req, res) => {
  const { outputDir, fileName } = req.body;

  if (!outputDir) {
    return res
      .status(400)
      .json({ error: 'Directorio de salida es requerido.' });
  }

  const targetDirectory = path.resolve(outputDir);
  const zipFileName = fileName || 'codigo-generado.zip';

  // Verificar que el directorio existe
  if (!fs.existsSync(targetDirectory)) {
    return res
      .status(404)
      .json({ error: 'El directorio de salida no existe.' });
  }

  // Configurar headers para descarga
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

  // Crear el archivo ZIP
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Máxima compresión
  });

  // Manejar errores del archivo
  archive.on('error', (err) => {
    console.error('Error al crear el archivo ZIP:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al crear el archivo ZIP' });
    }
  });

  // Enviar el archivo al cliente
  archive.pipe(res);

  // Agregar todos los archivos del directorio al ZIP
  archive.directory(targetDirectory, false);

  // Finalizar el archivo
  archive.finalize();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
