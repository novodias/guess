import AbortError from "../../models/abortError";
import { ServiceProvider } from "../../provider";
import Room from "../../room";
import RoomsCluster from "../../cluster"

export {}

declare global {
    namespace Express {
        export interface Request {
            cluster: RoomsCluster;
            services: ServiceProvider;
            room?: Room
        }

        export interface Response {
            abort: (abortError: AbortError) => void
        }
    }
}