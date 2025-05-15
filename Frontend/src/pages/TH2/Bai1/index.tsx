import { useState, useEffect } from 'react';
import { Button, Card, Typography, List } from 'antd';

const { Title, Text } = Typography;
const choices = ['Kéo', 'Búa', 'Bao'] as const;
type Choice = typeof choices[number];

const choiceImages: Record<Choice, string> = {
    'Kéo': '/images/Keo.png',
    'Búa': '/images/Bua.png',
    'Bao': '/images/Bao.png'
};

export default function RockPaperScissorsGame() {
    const [userChoice, setUserChoice] = useState<Choice | null>(null);
    const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
    const [result, setResult] = useState<string>('');
    const [history, setHistory] = useState<{ user: string; computer: string; result: string }[]>([]);

    useEffect(() => {
        const storedHistory = localStorage.getItem('rpsHistory');
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('rpsHistory', JSON.stringify(history));
    }, [history]);

    const getResult = (user: Choice, computer: Choice) => {
        if (user === computer) return 'Hòa';
        if (
            (user === 'Kéo' && computer === 'Bao') ||
            (user === 'Búa' && computer === 'Kéo') ||
            (user === 'Bao' && computer === 'Búa')
        ) {
            return 'Thắng';
        }
        return 'Thua';
    };

    const playGame = (choice: Choice) => {
        const compChoice = choices[Math.floor(Math.random() * choices.length)];
        setUserChoice(choice);
        setComputerChoice(compChoice);
        const gameResult = getResult(choice, compChoice);
        setResult(gameResult);
    };

    useEffect(() => {
        if (userChoice && computerChoice) {
            setHistory((prevHistory) => [
                ...prevHistory,
                { user: userChoice, computer: computerChoice, result: result },
            ]);
        }
    }, [result]);

    return (
        <div style={{ padding: 20, textAlign: 'center', background: '#f0f2f5', minHeight: '100vh' }}>
            <Title level={2} style={{ color: '#1890ff' }}>
                Trò chơi Oẳn Tù Tì
            </Title>
            <div style={{ marginBottom: 20 }}>
                {choices.map((choice) => (
                    <Button type='primary' key={choice} onClick={() => playGame(choice)} style={{ margin: '0 10px' }}>
                        {choice}
                    </Button>
                ))}
            </div>
            {userChoice && computerChoice && (
                <Card title='Kết quả' style={{ width: 300, margin: '20px auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Text strong>Player</Text> <br />
                            <img src={userChoice ? choiceImages[userChoice] : ''} alt={userChoice} style={{ width: 50, height: 50 }} />
                            <br />
                            <Text strong>{userChoice}</Text>
                        </div>
                        <div>
                            <Text strong>Bot</Text> <br />
                            <img src={computerChoice ? choiceImages[computerChoice] : ''} alt={computerChoice} style={{ width: 50, height: 50 }} />
                            <br />
                            <Text strong>{computerChoice}</Text>
                        </div>
                    </div>
                    <Text strong style={{ color: result === 'Thắng' ? 'green' : result === 'Thua' ? 'red' : 'gray' }}>
                        Kết quả: {result}
                    </Text>
                </Card>
            )}
            <Title level={4}>Lịch sử</Title>
            <List
                bordered
                style={{ width: 300, margin: '0 auto' }}
                dataSource={history}
                renderItem={(game, index) => (
                    <List.Item key={index}>
                        <Text strong>Bạn:</Text> {game.user} - <Text strong>Máy tính:</Text> {game.computer} -
                        <Text strong style={{ color: game.result === 'Thắng' ? 'green' : game.result === 'Thua' ? 'red' : 'gray' }}>
                            {game.result}
                        </Text>
                    </List.Item>
                )}
            />
        </div>
    );
}