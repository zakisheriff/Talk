import React, { useState } from 'react';
import { Upload, Search, Activity, User, Sun, Eye, Zap } from 'lucide-react';

const WanAnalysis = () => {
    const [image, setImage] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!image) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("image", image);

        try {
            const response = await fetch("http://localhost:8000/face/analyze", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (data.analysis) {
                setAnalysis(data.analysis);
            } else {
                alert("Analysis failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error(error);
            alert("Error connecting to server.");
        }
        setLoading(false);
    };

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setImage(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="wan-container">
            <div className="header-section">
                <h1>WAN Analysis</h1>
                <p>Face Quality, Liveness & Deepfake Detection</p>
            </div>

            <div className="upload-section">
                <div
                    className={`upload-box single ${isDragging ? 'dragging' : ''}`}
                    onClick={() => document.getElementById('wan-input').click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input id="wan-input" type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" hidden />
                    {image ? (
                        <img src={URL.createObjectURL(image)} alt="Preview" className="preview-img-small" />
                    ) : (
                        <div className="placeholder-icon"><Upload size={40} /> <br /> Drag & Drop or Click to Upload</div>
                    )}
                </div>
            </div>

            <button className="action-btn" onClick={handleAnalyze} disabled={loading || !image}>
                {loading ? (
                    <><Activity className="spin" size={20} style={{ marginRight: 8 }} /> Analyzing...</>
                ) : (
                    <><Search size={20} style={{ marginRight: 8 }} /> Run WAN Analysis</>
                )}
            </button>

            {analysis && (
                <div className="analysis-report">
                    <div className="score-card">
                        <h3>Realness Score</h3>
                        <div className="score-value" style={{ color: analysis.realness_score > 80 ? '#4caf50' : '#f44336' }}>
                            {analysis.realness_score.toFixed(1)}%
                        </div>
                    </div>

                    <div className="metrics-grid">
                        <div className="metric">
                            <span><Zap size={14} /> Deepfake Prob:</span>
                            <span>{analysis.deepfake_probability.toFixed(1)}%</span>
                        </div>
                        <div className="metric">
                            <span><User size={14} /> Face Quality:</span>
                            <span>{analysis.face_quality.toFixed(1)}</span>
                        </div>
                        <div className="metric">
                            <span><Activity size={14} /> Liveness:</span>
                            <span>{analysis.liveness_score}%</span>
                        </div>
                        <div className="metric">
                            <span><Sun size={14} /> Lighting:</span>
                            <span>{analysis.lighting_quality.toFixed(1)}</span>
                        </div>
                        <div className="metric">
                            <span><Eye size={14} /> Blur:</span>
                            <span>{analysis.blur_amount.toFixed(1)}</span>
                        </div>
                        <div className="metric">
                            <span><User size={14} /> Age/Gender:</span>
                            <span>{analysis.age} / {analysis.gender}</span>
                        </div>
                    </div>

                    <div className="pose-info">
                        <h4>Pose Angles</h4>
                        <p>Pitch: {analysis.pose_angles.pitch.toFixed(1)}°</p>
                        <p>Yaw: {analysis.pose_angles.yaw.toFixed(1)}°</p>
                        <p>Roll: {analysis.pose_angles.roll.toFixed(1)}°</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WanAnalysis;
