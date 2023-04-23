import { useDispatch } from 'react-redux';

import type { StoreDispatch } from '../store';

export const useTypedDispatch: () => StoreDispatch = useDispatch
