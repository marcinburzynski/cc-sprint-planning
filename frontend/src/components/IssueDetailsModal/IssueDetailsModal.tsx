import { useState, useEffect, useRef } from 'react';
import xss, { escapeAttrValue, escapeHtml, OnTagAttrHandler, OnTagHandler } from 'xss';

import { jira } from '../../services/jira';
import { renderComponentToNode } from '../../utils/react';
import { Modal } from '../Modal';
import { Spinner } from '../Spinner';

import type { JiraIssueWithDetails } from '../../services/jira/jira.types';

import './IssueDetailsModal.scss';


type IssueDetailsModalProps = {
    issueKey: string;
    onHide: () => void;
}

export const IssueDetailsModal = ({ issueKey, onHide }: IssueDetailsModalProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [issue, setIssue] = useState<JiraIssueWithDetails>();
    const [loadingIssue, setLoadingIssue] = useState(false);

    const getAssetSourcesAndStartLoading = (
        jiraIssue: JiraIssueWithDetails,
        container: HTMLDivElement,
        elementClassName: string,
        loaderClassName: string,
    ) => {
        const spinnerAsNode = renderComponentToNode(
            <div className={loaderClassName}>
                <Spinner />
            </div>
        );

        const originalElements = container.getElementsByClassName(elementClassName);

        const sources = Array.from(originalElements).map((embeddedImage) => {
            if (!embeddedImage.textContent) return;

            const textContent = embeddedImage.textContent;
            embeddedImage.textContent = '';

            const regexMatches = /(?<=attachment\/(content\/)?)\d+/.exec(textContent);

            if (!regexMatches) return;

            return jiraIssue.fields.attachment.find((attachment) => attachment.id === regexMatches[0]);
        });

        Array.from(originalElements).forEach((element) => {
            element.replaceWith(spinnerAsNode);
        });

        return sources;
    };

    const handleFetchImages = async (jiraIssue: JiraIssueWithDetails) => {
        if (!containerRef.current) return;

        const sources = getAssetSourcesAndStartLoading(
            jiraIssue,
            containerRef.current,
            'embeddedImage',
            'image-loader-container',
        );

        const imageLoaders = containerRef.current.getElementsByClassName('image-loader-container');

        await Promise.all(sources.map((source, index) => new Promise(async (resolve) => {
            if (!source) return resolve(null);

            const asset = await jira.getSecuredAsset(source.content);

            const imageTag = document.createElement('img');
            imageTag.src = asset;
            imageTag.onclick = () => {
                const img = new Image();
                img.src = asset;

                const w = window.open('', '_blank')
                w?.document.write(img.outerHTML);
                w?.document.close()
            };

            imageLoaders[index]?.replaceWith(imageTag);

            resolve(null)
        })))
    }

    const handleFetchVideos = async (jiraIssue: JiraIssueWithDetails) => {
        if (!containerRef.current) return;

        const sources = getAssetSourcesAndStartLoading(
            jiraIssue,
            containerRef.current,
            'embeddedObject',
            'video-loader-container',
        );

        const videoLoaders = containerRef.current.getElementsByClassName('video-loader-container');

        await Promise.all(sources.map((source, index) => new Promise(async (resolve) => {
            if (!source) return resolve(null);

            const asset = await jira.getSecuredAsset(source.content);

            const videoTag = document.createElement('video');
            videoTag.controls = true;
            videoTag.src = asset

            videoLoaders[index]?.replaceWith(videoTag);

            resolve(null);
        })))
    }

    const handleRemoveErrors = () => {
        if (!containerRef.current) return;

        const errors = containerRef.current.getElementsByClassName('error');

        Array.from(errors).forEach((error) => {
            error.remove();
        })
    }

    const handleIgnoreTagAttr: OnTagAttrHandler = (tag, name, value) => {
        if (name === 'class') {
            return `${name}="${escapeAttrValue(value)}"`;
        }
    }

    const handleOnTag: OnTagHandler = (tag, html) => {
        if (tag === 'img') {
            return `<div class="embeddedImage">${escapeHtml(html)}</div>`;
        }
    }

    const handleFetchIssueDetails = async () => {
        setLoadingIssue(true);
        const { data } = await jira.getIssue(issueKey);

        if (containerRef.current) {
            containerRef.current.innerHTML = xss(data.renderedFields.description, {
                onTag: handleOnTag,
                onIgnoreTagAttr: handleIgnoreTagAttr,
            });
        }

        setIssue(data);
        setLoadingIssue(false);
        handleRemoveErrors();
        handleFetchVideos(data);
        handleFetchImages(data);
    }

    useEffect(() => {
        if (!issue && !loadingIssue) {
            handleFetchIssueDetails();
        }
    }, [])

    const handleOpenInJira = async () => {
        const jiraUrl = await jira.getJiraUrl();

        window.open(`${jiraUrl}/browse/${issueKey}`, '_blank');
    }

    const header = (
        <div className="issue-details-modal-header">
            <span className="issue-link" onClick={handleOpenInJira}>{issueKey}</span>
            <span> details</span>
        </div>
    )

    return (
        <Modal
            stopPropagation
            className="issue-details-modal"
            header={header}
            onHide={onHide}
        >
            <>
                <div className="issue-details-modal-content">
                    <div className="issue-details" ref={containerRef} />
                    {loadingIssue && (
                        <div className="loader-container">
                            <Spinner />
                        </div>
                    )}
                </div>
            </>
        </Modal>
    )
}
