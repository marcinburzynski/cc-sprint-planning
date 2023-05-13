import ClassName from 'classnames';

import './SkeletonLoader.scss';

export const SkeletonLoader = ({ className, ...props }: JSX.IntrinsicElements['div']) => {
    const fullClassName = ClassName('default-skeleton-loader', className);

    return <div className={fullClassName} {...props} />
}
