export interface DesignerOption {
  id: number;
  name: string;
}

export const DesignStatus = {
  REJECTED: 0,
  PENDING: 1,
  REVIEW: 2,
  APPROVED: 3,
} as const;

export type DesignStatus =
  (typeof DesignStatus)[keyof typeof DesignStatus];

export const DesignDetailStatus = {
  PENDING: "pending",
  IN_REVIEW: "in_review",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EMPTY_DETAIL: "empty_detail",
} as const;

export type DesignDetailStatus =
  (typeof DesignDetailStatus)[keyof typeof DesignDetailStatus];

export const DesignFileType = {
  CLIENT_REFERENCE: "CLIENT_REFERENCE",
  DESIGN_PROPOSAL: "DESIGN_PROPOSAL",
} as const;

export type DesignFileType =
  (typeof DesignFileType)[keyof typeof DesignFileType];

export interface DesignFile {
  id: number;
  detailId: number;
  url: string;
}

export interface DesignComment {
  id: number;
  detailId: number;
  comment: string;
  registration_date: string;
}



export interface DesignDetailDTO {
  id: number;
  designId: number;
  description: string;
  category: string;
  team_name: string | null;

  design_img: string | null;
  printer_type: string | null;
  observations: string | null;
  status: DesignDetailStatus;
  files: DesignFile[];
  comments?: DesignComment[];
}

export interface DesignDTO {
  id: number;
  quoteId: number;
  designerId?: number | null;
  designer: string;
  delivery_date: string;
  status: number;
  details: DesignDetailDTO[];
}

export interface DesignStatusCountsDTO {
  rejected: string;
  pending: string;
  in_review: string;
  accepted: string;
}

export interface MyDesignsResponseDTO {
  designs: DesignDTO[];
  statusCounts: DesignStatusCountsDTO;
}

export interface DesignMovementDTO {
  id: number; 
  designId: number;
  comment: string;
  registration_date: string;
  user: string;
}

export interface DesignMovementsResponseDTO {
  movements: DesignMovementDTO[];
  pagination: DesignsPagination;
}

export interface DesignDetail {
  id: number;
  designId: number;
  description: string;
  category: string;
  teamName: string | null;
  designImg: string | null;
  printerType: string | null;
  observations: string | null;
  status: DesignDetailStatus;
  files: DesignFile[];
  comments: DesignComment[];
}

export interface Design {
  id: number;
  quoteId: number;
  designerId: number | null;
  designerName: string;
  deliveryDate: string;
  status: DesignStatus;
  details: DesignDetail[];
}

export interface DesignStatusCounts {
  rejected: number;
  pending: number;
  inReview: number;
  accepted: number;
}

export interface DesignsPagination {
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Designer {
  designerId: number;
  designerName: string;
}

export interface GetDesignsParams {
page?: number;
  status?: DesignStatus;
  search?: string;
  designer?: number;
  order?: "ASC" | "DESC";
}

export interface DesignDetailByIdDTO {
  id: number;
  articleId: number;
  description: string;
  category: string;
  fabric_type: number;
  amount: number;
  team_name: string | null;
  design_img: string | null;
  printer_type: string | null;
  observations: string | null;
  status: DesignDetailStatus;
  files: DesignFile[];
  comments: DesignComment[];
}
export interface GetDesignByIdDTO {
  id: number;
  quoteId: number;
  designerId: number | null;
  designer: string;
  delivery_date: string;
  clientId: number;
  name: string;
  paternalLastName: string;
  maternalLastName: string;
  phone: string;
  status: DesignStatus;
  details: DesignDetailByIdDTO[];
}

export interface DesignDetailById {
  id: number;
  articleId: number;
  description: string;
  category: string;
  fabricType: number;
  amount: number;
  teamName: string | null;
  designImg: string | null;
  printerType: string | null;
  observations: string | null;
  status: DesignDetailStatus;
  files: DesignFile[];
  comments: DesignComment[];
}

export interface DesignById {
  id: number;
  quoteId: number;
  designerId: number | null;
  designerName: string;
  deliveryDate: string;
  clientId: number;
  clientName: string;         
  clientPhone: string;
  status: DesignStatus;
  details: DesignDetailById[];
}