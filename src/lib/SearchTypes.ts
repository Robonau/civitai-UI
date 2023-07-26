export enum types {
  "Checkpoint" = "Checkpoint",
  "TextualInversion" = "TextualInversion",
  "Hypernetwork" = "Hypernetwork",
  "AestheticGradient" = "AestheticGradient",
  "LORA" = "LORA",
  "LyCORIS" = 'LoCon',
  "Controlnet" = "Controlnet",
  "Upscaler" = "Upscaler",
  "VAE" = "VAE",
  "Poses" = "Poses",
  "Wildcards" = "Wildcards",
  "Other" = "Other"
}

export enum sort {
  "Highest Rated" = "Highest Rated",
  "Most Downloaded" = "Most Downloaded",
  "Most Liked" = "Most Liked",
  "Most Discussed" = "Most Discussed",
  "Newest" = "Newest"
}

export enum period {
  "All Time" = 'AllTime',
  Year = 'Year',
  Month = 'Month',
  Week = 'Week',
  Day = 'Day'
}

export enum baseModel {
  "SD 1.4" = "SD 1.4",
  "SD 1.5" = "SD 1.5",
  "SD 2.0" = "SD 2.0",
  "SD 2.0 768" = "SD 2.0 768",
  "SD 2.1" = "SD 2.1",
  "SD 2.1 768" = "SD 2.1 768",
  "SD 2.1 Unclip" = "SD 2.1 Unclip",
  "SDXL 0.9" = "SDXL 0.9",
  "Other" = "Other"
}

export enum allowCommercialUse {
  None = 'None',
  Image = 'Image',
  Rent = 'Rent',
  Sell = 'Sell'
}

export enum periodMode {
  Published = 'published',
  Stats = 'stats'
}

export interface IsearchObject {
  limit?: number
  page?: number
  query?: string
  tag?: string
  username?: string
  types?: types[]
  sort?: sort
  period?: period
  rating?: number
  favorites?: boolean
  hidden?: boolean
  primaryFileOnly?: boolean
  allowNoCredit?: boolean
  allowDerivatives?: boolean
  allowDifferentLicenses?: boolean
  allowCommercialUse?: allowCommercialUse
  nsfw?: boolean
  periodMode?: periodMode,
  baseModel?: baseModel[],
  earlyAccess?: boolean
  token?: string
}

interface metadata {
  totalItems: number,
  currentPage: number,
  pageSize: number,
  totalPages: number
}

interface modelstats {
  downloadCount: number,
  ratingCount: number,
  rating: number
}

interface stats extends modelstats {
  favoriteCount: number,
  commentCount: number,
}

interface creator {
  username: string,
  image: string
}
enum fp { fp16, fp32 }

enum size { full, pruned }

enum format { SafeTensor, PickleTensor, Other }

interface hashes {
  "AutoV1": string,
  "AutoV2": string,
  "SHA256": string,
  "CRC32": string,
  "BLAKE3": string
}

interface imageHashs {
  "vae": string,
  "model": string,
  "embed:fcNeg-neg": string
}

interface imageResource {
  "name": string,
  "type": string,
  "weight"?: number,
  hash?: string
}

interface ImageMeta {
  "VAE": string,
  "Size": string,
  "seed": number,
  "Model": string,
  "steps": number,
  "Parser": string,
  "hashes": imageHashs,
  "prompt": string,
  "Version": string,
  "sampler": string,
  "cfgScale": number,
  "clipSkip": number,
  "resources": imageResource[],
  "Model hash": string,
  "Hires steps": string,
  "Hires upscale": string,
  "Hires upscaler": string,
  "negativePrompt": string,
  "Denoising strength": string,
  "Token merging ratio": string,
  "Token merging ratio hr": string
}

interface images {
  "id": number,
  "url": string,
  "nsfw": string,
  "width": number,
  "height": number,
  "hash": string,
  "meta": ImageMeta
}

interface files {
  "id": number,
  "url": string,
  "sizeKB": number,
  "name": string,
  "type": "Model",
  "metadata": {
    "fp": fp | undefined,
    "size": size | undefined,
    "format": format | undefined
  },
  "pickleScanResult": string,
  "pickleScanMessage": string,
  "virusScanResult": string,
  "scannedAt": string,
  "hashes": hashes,
  "downloadUrl": string,
  "primary": boolean
}

interface modelVersions {
  "id": number,
  "modelId": number,
  "name": string,
  "createdAt": string,
  "updatedAt": string,
  "trainedWords": string[],
  "baseModel": baseModel,
  "earlyAccessTimeFrame": number,
  "description": string,
  "stats": modelstats,
  "files": files[],
  "images": images[],
  "downloadUrl": string
}

interface item {
  "id": number,
  "name": string,
  "description": string,
  "type": types,
  "poi": boolean,
  "nsfw": boolean,
  "allowNoCredit": boolean,
  "allowCommercialUse": allowCommercialUse,
  "allowDerivatives": boolean,
  "allowDifferentLicense": boolean,
  "stats": stats,
  "creator": creator,
  "tags": string[],
  "modelVersions": modelVersions[]
}

export interface ISearchResponce {
  items: item[],
  metadata: metadata
}