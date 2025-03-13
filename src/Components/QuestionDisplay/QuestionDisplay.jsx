import { useState, useEffect } from "react";
import { Card } from "react-bootstrap";

const QuestionDisplay = () => {
    const questions = [
        "What is your favorite fruit?",
        "How often do you eat healthy food?",
        "Which vitamins are essential for good health?",
        "What are the benefits of organic food?",
        "How do you maintain a balanced diet?"
    ];

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuestionIndex(prevIndex => (prevIndex + 1) % questions.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="position-absolute top-50 end-0 me-5 translate-middle-y shadow-lg p-3" style={{width: "400px"}}>
            <Card.Body>
                <Card.Title className="text-center text-primary">Live Question</Card.Title>
                <Card.Text className="text-center text-muted">
                    {questions[currentQuestionIndex]}
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

export default QuestionDisplay;
