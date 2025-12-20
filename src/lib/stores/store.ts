import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "@/stores/slices/userSlice";

const rootReducer = combineReducers({
  user: userReducer,
  // 他のreducerもここに追加
});

export const makeStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
