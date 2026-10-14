import { http } from "./http";
import type {
  MyDesignsResponseDTO,
  DesignMovementDTO,  DesignMovementsResponseDTO,
  DesignDTO,
  DesignDetailDTO,
  Design,
  DesignDetail,
  DesignStatusCounts,
DesignsPagination,
  DesignerOption,
  GetDesignsParams,
} from "../types/design";
export type { GetDesignsParams };


function mapDetail(dto: DesignDetailDTO): DesignDetail {
  return {
    id: dto.id,
    designId: dto.designId,
    description: dto.description,
    category: dto.category,
    teamName: dto.team_name,
    designImg: dto.design_img,
    printerType: dto.printer_type,
    observations: dto.observations,
    status: dto.status,
    files: dto.files ?? [],
    comments: dto.comments ?? [],
  };
}

function mapDesign(dto: DesignDTO): Design {
  return {
    id: dto.id,
    quoteId: dto.quoteId,
    designerId: dto.designerId ?? null,
    designerName: dto.designer,
    deliveryDate: dto.delivery_date,
    status: dto.status as Design["status"],
    details: dto.details.map(mapDetail),
  };
}

function mapStatusCounts(dto: MyDesignsResponseDTO["statusCounts"]): DesignStatusCounts {
  return {
    rejected: Number(dto.rejected),
    pending: Number(dto.pending),
    inReview: Number(dto.in_review),
    accepted: Number(dto.accepted),
  };
}



interface DesignsListResponseDTO {
  designs: DesignDTO[];
  statusCounts: MyDesignsResponseDTO["statusCounts"];
  pagination: DesignsPagination;
}


export interface GetDesignsResult {
  designs: Design[];
  statusCounts: DesignStatusCounts;
  pagination: DesignsPagination;
}

export const getDesignsService = async (
  params: GetDesignsParams = {}
): Promise<GetDesignsResult> => {
  const { data } = await http.get<DesignsListResponseDTO>("/design", { params });
  return {
    designs: data.designs.map(mapDesign),
    statusCounts: mapStatusCounts(data.statusCounts),
    pagination: data.pagination,
  };
};



export const getDesignByIdService = async (id: number): Promise<Design> => {
  const { data } = await http.get<DesignDTO>(`/design/${id}`);
  return mapDesign(data);
};



export interface MyDesignsResponse {
  designs: Design[];
  statusCounts: DesignStatusCounts;
  pagination: DesignsPagination | null;
}

export const getMyDesignsService = async (
  params: GetDesignsParams = {}
): Promise<MyDesignsResponse> => {
  const { data } = await http.get<MyDesignsResponseDTO & { pagination?: DesignsPagination }>(
    "/design/assigned-to-me",
    { params }
  );
  return {
    designs: data.designs.map(mapDesign), 
    statusCounts: mapStatusCounts(data.statusCounts),
    pagination: data.pagination ?? null,
  };
}


export interface GetMovementsResult {
  movements: DesignMovementDTO[];
  pagination: DesignsPagination;
}

export const getMyDesignMovementsService = async (
page: number = 1

): Promise<GetMovementsResult> => {
  const { data } = await http.get<DesignMovementsResponseDTO>(
    "/design-movements/my-movements",
    { params: { page } }
  );
  return {
    movements: data.movements,
    pagination: data.pagination,
  };
};

export const getFreeDesignsService = async (): Promise<Design[]> => {
  const { data } = await http.get<DesignDTO[]>("/design/to-assign");
  return data.map(mapDesign);
};

export const sendDesignToReviewService = async (
  designId: number
): Promise<{ message: string }> => {
  const { data } = await http.put<{ message: string }>(`/design/${designId}/review`);
  return data;
};



export const claimDesignService = async (
  designId: number
): Promise<{ message: string }> => {
  const { data } = await http.put<{ message: string }>(`/design/${designId}/assign-to-me`);
  return data;
};



export interface UploadDesignImgPayload {
  url: string;
}

export const uploadDesignImgService = async (
  detailId: number,
  payload: UploadDesignImgPayload
): Promise<{ message: string }> => {
  const { data } = await http.patch<{ message: string }>(
    `/design-detail/${detailId}/upload-img`,
    payload
  );
  return data;
};



export const removeDesignImgService = async (
  detailId: number
): Promise<{ message: string }> => {
  const { data } = await http.patch<{ message: string }>(`/design-detail/${detailId}/remove-img`);
  return data;
};

export const getAvailableDesignersService = async (): Promise<DesignerOption[]> => {
  const { data } = await http.get<DesignerOption[]>("/user/designer");
  return data;
};

export interface AssignDesignerPayload {
  designerId: number;
}

export const assignDesignerService = async (
  designId: number,
  payload: AssignDesignerPayload
): Promise<{ message: string }> => {
  const { data } = await http.put<{ message: string }>(
    `/design/${designId}/designer`,
    payload
  );
  return data;
};



export interface AddFileReferencePayload {
  url: string;
}

export const addFileReferenceService = async (
  detailId: number,
  payload: AddFileReferencePayload
): Promise<{ message: string }> => {
  const { data } = await http.post<{ message: string }>(
    `/design-detail/${detailId}/file`,
    payload
  );
  return data;
};



export interface UpdateDesignDetailPayload {
  teamName?: string;
  printerType?: string;
  observations?: string;
}

export const updateDesignDetailService = async (
  detailId: number,
  payload: UpdateDesignDetailPayload
): Promise<{ message: string }> => {
  const { data } = await http.put<{ message: string }>(
    `/design-detail/${detailId}`,
    payload
  );
  return data;
};



export const acceptDesignDetailService = async (
  detailId: number
): Promise<{ message: string }> => {
  const { data } = await http.patch<{ message: string }>(
    `/design-detail/${detailId}/accept`
  );
  return data;
};

export const rejectDesignDetailService = async (
  detailId: number,
  payload: { comment: string }
): Promise<{ message: string }> => {
  const { data } = await http.patch<{ message: string }>(
    `/design-detail/${detailId}/reject`,
    payload
  );
  return data;
};