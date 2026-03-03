import { SlideConfig } from "@/types/episode";
import { MIN_WATCHES_FOR_TOP_MOVIE } from "@/lib/constants";
import TotalWatchesSlide from "./slides/TotalWatchesSlide";
import TopTVShowSlide from "./slides/TopTVShowSlide";
import TopMovieSlide from "./slides/TopMovieSlide";
import FavoriteGenreSlide from "./slides/FavoriteGenreSlide";
import ViewerAvatarSlide from "./slides/ViewerAvatarSlide";

export const SLIDE_REGISTRY: SlideConfig[] = [
  {
    id: "total-watches",
    component: TotalWatchesSlide,
    shouldShow: () => true,
  },
  {
    id: "top-tv-show",
    component: TopTVShowSlide,
    shouldShow: (insights) => insights.topTVShow !== null,
  },
  {
    id: "top-movie",
    component: TopMovieSlide,
    shouldShow: (insights) => insights.topMovie !== null && insights.topMovie.watched >= MIN_WATCHES_FOR_TOP_MOVIE,
  },
  {
    id: "favorite-genre",
    component: FavoriteGenreSlide,
    shouldShow: (insights) => insights.genreBreakdown.length > 0,
  },
  {
    id: "viewer-avatar",
    component: ViewerAvatarSlide,
    shouldShow: () => true,
  },
];
