import { useSelector, TypedUseSelectorHook } from 'react-redux';

import type { StoreStateType } from '../store';

export const useTypedSelector: TypedUseSelectorHook<StoreStateType> = useSelector
