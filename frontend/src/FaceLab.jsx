import React, { useState } from 'react';
import { uploadFile } from "./api";
import { ArrowRight, Upload, Download, RefreshCw, Image as ImageIcon } from 'lucide-react';

const FaceLab = () => {
    const [source, setSource] = useState(null);
    const [target, setTarget] = useState(null);
    const [output, setOutput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const handleFileChange = (e, setFile) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSwap = async () => {
        if (!source || !target) {
            alert("Please upload both source and target images.");
            return;
        }

        setLoading(true);
        setStatus("Uploading images...");

        const formData = new FormData();
        formData.append("source", source);
        formData.append("target", target);

        try {
            setStatus("Processing Face Swap... This may take a moment.");
            const response = await fetch("http://localhost:8000/face/swap", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.error) {
                alert("Error: " + data.error);
                setStatus("Failed.");
            } else {
                setOutput(`http://localhost:8000/${data.output_path}`);
                setStatus("Success!");
            }
        } catch (error) {
            console.error(error);
            setStatus("Error connecting to server.");
        }
        setLoading(false);
    };

    const [isDraggingSource, setIsDraggingSource] = useState(false);
    const [isDraggingTarget, setIsDraggingTarget] = useState(false);

    const handleDragOver = (e, setDragging) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e, setDragging) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = (e, setDragging, setFile) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="facelab-container">
            <div className="header-section">
                <h1>Face Lab</h1>
                <p>Local Face Fusion powered by InsightFace</p>
            </div>

            <div className="upload-area">
                <div
                    className={`upload-box ${isDraggingSource ? 'dragging' : ''}`}
                    onClick={() => document.getElementById('source-input').click()}
                    onDragOver={(e) => handleDragOver(e, setIsDraggingSource)}
                    onDragLeave={(e) => handleDragLeave(e, setIsDraggingSource)}
                    onDrop={(e) => handleDrop(e, setIsDraggingSource, setSource)}
                >
                    <h3>Source Face</h3>
                    <input id="source-input" type="file" onChange={(e) => handleFileChange(e, setSource)} accept="image/*" hidden />
                    {source ? (
                        <img src={URL.createObjectURL(source)} alt="Source" className="preview-img" />
                    ) : (
                        <div className="placeholder-icon"><Upload size={40} /> <br /> Drag & Drop or Click</div>
                    )}
                </div>

                <div className="arrow">
                    <ArrowRight size={32} />
                </div>

                <div
                    className={`upload-box ${isDraggingTarget ? 'dragging' : ''}`}
                    onClick={() => document.getElementById('target-input').click()}
                    onDragOver={(e) => handleDragOver(e, setIsDraggingTarget)}
                    onDragLeave={(e) => handleDragLeave(e, setIsDraggingTarget)}
                    onDrop={(e) => handleDrop(e, setIsDraggingTarget, setTarget)}
                >
                    <h3>Target Image/Video</h3>
                    <input id="target-input" type="file" onChange={(e) => handleFileChange(e, setTarget)} accept="image/*,video/*" hidden />
                    {target ? (
                        target.type.startsWith('video/') ? (
                            <video src={URL.createObjectURL(target)} className="preview-img" controls />
                        ) : (
                            <img src={URL.createObjectURL(target)} alt="Target" className="preview-img" />
                        )
                    ) : (
                        <div className="placeholder-icon"><ImageIcon size={40} /> <br /> Drag & Drop or Click</div>
                    )}
                </div>
            </div>

            <button className="action-btn" onClick={handleSwap} disabled={loading}>
                {loading ? (
                    <><RefreshCw className="spin" size={20} style={{ marginRight: 8 }} /> Processing...</>
                ) : (
                    "Run Face Swap"
                )}
            </button>

            {status && <p className="status-text">{status}</p>}

            {output && (
                <div className="result-area">
                    <h3>Result</h3>
                    {output.endsWith('.mp4') ? (
                        <video src={output} controls className="result-img" />
                    ) : (
                        <img src={output} alt="Result" className="result-img" />
                    )}
                    <button
                        className="action-btn"
                        onClick={async () => {
                            try {
                                const response = await fetch(output);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = output.endsWith('.mp4') ? "face_swap_result.mp4" : "face_swap_result.jpg";
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                            } catch (e) {
                                console.error("Download failed:", e);
                                window.open(output, '_blank');
                            }
                        }}
                    >
                        <Download size={18} style={{ marginRight: 8 }} /> Download Result
                    </button>
                </div>
            )}
        </div>
    );
};

export default FaceLab;
