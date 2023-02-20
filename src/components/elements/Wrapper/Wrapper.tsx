import { ReactElement } from 'react';

import { useIsMounted } from '../../../../hooks/useIsMounted';

export interface IWrapper {
  children: ReactElement;
}

const Wrapper = ({ children }: IWrapper) => {
  const isMounted = useIsMounted()

  if (!isMounted) {
    return null
  }

  return children;
};

export default Wrapper;