import axios from 'axios';

export interface BusRoute {
  id: string;
  route_name: string;
  busId: string;
  departure_time: string;
  created_at: string;
  stops: Array<{
    name: string;
    latitude: number;
    longitude: number;
  }>;
  start_location: string;
  end_location: string;
  status: string;
}

// /api/v1/user/route/filter


export class HomeScreenService {
  private baseUrl = 'https://adcet-hackathon-backend.onrender.com'; // Replace with your actual API base URL

  async getFilterRoutes(startLocation:string , endLocation:string){
     try {
        const response = await axios.post(`${this.baseUrl}/api/v1/user/route/filter`, {
           startLocation: startLocation,
           endLocation: endLocation
        });
        return response.data;
     } catch (error) {
        console.error('Error fetching bus routes:', error);
        throw error;
     }
  }


  async getBusRoutes(startLocation: string, endLocation: string): Promise<BusRoute[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/bus-routes`, {
        params: {
          start: startLocation,
          end: endLocation
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching bus routes:', error);
      throw error;
    }
  }

  async getBusDetails(busId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/user/route/${busId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bus details:', error);
      throw error;
    }
  }

  async getCrowdDensity(busId: string): Promise<'Low' | 'Medium' | 'High'> {
    try {
      const response = await axios.get(`${this.baseUrl}/crowd-density/${busId}`);
      return response.data.density;
    } catch (error) {
      console.error('Error fetching crowd density:', error);
      throw error;
    }
  }

  async getEstimatedFare(busId: string, startStop: string, endStop: string): Promise<number> {
    try {
      const response = await axios.get(`${this.baseUrl}/fare-estimate`, {
        params: {
          busId,
          startStop,
          endStop
        }
      });
      return response.data.fare;
    } catch (error) {
      console.error('Error fetching fare estimate:', error);
      throw error;
    }
  }
}

export const homeScreenService = new HomeScreenService();
