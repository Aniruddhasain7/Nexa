import multer from 'multer'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'text/plain', 'application/pdf',
  ]
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Unsupported file type'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
})

export default upload
