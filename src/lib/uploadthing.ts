import { generateReactHelpers } from '@uploadthing/react'

import type { OurFileRouter } from '@/app/api/uploadthing/core'

export const { uploadFiles, useUploadThing } = generateReactHelpers<OurFileRouter>()
