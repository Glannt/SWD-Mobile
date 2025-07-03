import { apiGet } from "../utils/api";
import { Campus, Program } from "../types/api";

class CampusService {
  private readonly baseUrl = "/campus";

  async getCampuses(): Promise<Campus[]> {
    return apiGet<Campus[]>(this.baseUrl);
  }

  async getCampus(campusId: string): Promise<Campus> {
    return apiGet<Campus>(`${this.baseUrl}/${campusId}`);
  }

  async getPrograms(campusId?: string): Promise<Program[]> {
    const url = campusId
      ? `${this.baseUrl}/${campusId}/programs`
      : `${this.baseUrl}/programs`;
    return apiGet<Program[]>(url);
  }

  async getProgram(programId: string): Promise<Program> {
    return apiGet<Program>(`${this.baseUrl}/programs/${programId}`);
  }

  async getAdmissionPlans(): Promise<unknown[]> {
    return apiGet<unknown[]>("/admission-plans");
  }

  async getAdmissionYears(): Promise<unknown[]> {
    return apiGet<unknown[]>("/admission-years");
  }

  async getCampusDiscounts(): Promise<unknown[]> {
    return apiGet<unknown[]>("/campus-discounts");
  }
}

export const campusService = new CampusService();
export default campusService;
