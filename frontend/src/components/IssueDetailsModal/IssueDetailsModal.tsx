import { useState, useEffect, useRef } from 'react';
import xss from 'xss';

import { jira } from '../../services/jira';
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

    const handleFetchImages = async (jiraIssue: JiraIssueWithDetails) => {
        if (!containerRef.current) return;

        const imagesInContainer = containerRef.current.getElementsByTagName('img')

        const sources = Array.from(imagesInContainer).map((element) => {
            const fullSource = element.src;
            const fileName = fullSource.split('/').at(-1)

            if (!fileName) return;

            return jiraIssue.fields.attachment.find((attachment) => fileName.includes(attachment.filename));
        })

        const images = await Promise.all(sources.map((source) => {
            if (source) {
                return jira.getImage(source.content);
            }

            return Promise.resolve();
        }))

        images.forEach((image, index) => {
            if (!image) return;

            imagesInContainer[index].src = image;
            imagesInContainer[index].onclick = (e) => {
                const img = new Image();
                img.src = image;

                const w = window.open('', '_blank')
                w?.document.write(img.outerHTML);
                w?.document.close()
            };
        })
    }

    const handleFetchIssueDetails = async () => {
        setLoadingIssue(true);
        const { data } = await jira.getIssue(issueKey);

        if (containerRef.current) {
            containerRef.current.innerHTML = xss(data.renderedFields.description);
        }

        setIssue(data);
        setLoadingIssue(false);
        handleFetchImages(data);
    }

    useEffect(() => {
        if (!issue && !loadingIssue) {
            handleFetchIssueDetails();
        }

        return () => {
            setIssue(undefined);
        }
    }, [])

    return (
        <Modal
            className="issue-details-modal"
            header={`${issueKey} details`}
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
