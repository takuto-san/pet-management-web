import { configureStore, combineReducers } from "@reduxjs/toolkit";
// import counterReducer from "@/stores/count/counterSlice";

const rootReducer = combineReducers({
  // counter: counterReducer,

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
