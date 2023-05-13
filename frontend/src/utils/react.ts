import { renderToString } from 'react-dom/server';

export const renderComponentToNode = (element: JSX.Element) => {
    const asHTMLString = renderToString(element);

    const container = document.createElement('div');
    container.innerHTML = asHTMLString;

    return container.firstChild as Node;
}
