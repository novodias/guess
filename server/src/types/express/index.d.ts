import AbortError from "../../models/abortError";
import { ServiceProvider } from "../../provider";
import Room from "../../room";
import RoomsCluster from "../../cluster"
import SongsService from "../../services/songs.service";
import TitlesService from "../../services/titles.service";

export {}

declare global {
    namespace Express {
        export interface Request {
            titles: TitlesService;
            songs: SongsService;
            cluster: RoomsCluster;
            room?: Room
        }

        export interface Response {
            abort: (abortError: AbortError) => void
        }
    }
}