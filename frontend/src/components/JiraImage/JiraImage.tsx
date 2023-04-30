import { useState, useEffect } from 'react';

import { jira } from '../../services/jira';

type JiraImageProps = Omit<JSX.IntrinsicElements['img'], 'src'> & {
    src: string;
}

export const JiraImage = ({ src, ...props }: JiraImageProps) => {
    const [imgAsURL, setImgAsURL] = useState<string>();

    const handleGetImage = async () => {
        const res = await jira.getImage(src);
        if (!res) return;
        setImgAsURL(res)
    }

    useEffect(() => {
        handleGetImage()
    }, [])

    if (!imgAsURL) return null;

    return <img src={imgAsURL} {...props} />
}
