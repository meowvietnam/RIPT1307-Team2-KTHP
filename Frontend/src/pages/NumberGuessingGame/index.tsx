import { Card, Input, Button, message } from 'antd';
import { useState} from 'react';
//import { unitName } from '@/services/base/constant';

const NumberGuessingGame = () => {
    const [randomNumber, setRandomNumber] = useState(0);
    const [guess, setGuess] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [feedback, setFeedback] = useState('');

    

    const startNewGame = () => {
		const newRandomNumber = Math.floor(Math.random() * 100) + 1;
        setRandomNumber(newRandomNumber);
        setGuess('');
        setAttempts(0);
        //setFeedback(`${newRandomNumber}`);
		setFeedback('');

    };

    const handleGuess = () => {
        const guessNumber = parseInt(guess, 10);
        if (isNaN(guessNumber)) {
            message.error('Vui lòng nhập một số hợp lệ!');
            return;
        }

        setAttempts(attempts + 1);

        if (guessNumber < randomNumber) {
            setFeedback('Bạn đoán quá thấp!');
        } else if (guessNumber > randomNumber) {
            setFeedback('Bạn đoán quá cao!');
        } else {
            setFeedback('Chúc mừng! Bạn đã đoán đúng!');
            message.success('Chúc mừng! Bạn đã đoán đúng!');
        }

        if (attempts >= 9 && guessNumber !== randomNumber) {
            setFeedback(`Bạn đã hết lượt! Số đúng là ${randomNumber}.`);
            message.error(`Bạn đã hết lượt! Số đúng là ${randomNumber}.`);
        }
    };

    return (
        <Card bodyStyle={{ height: '100%' }}>
            <div className='home-welcome'>
				<h1>
					Trò chơi đoán số!
				</h1>
                <div>
                    <b>{attempts} / 10 lượt đoán</b>
                </div>
           
                <Input
                    placeholder='Nhập số bạn đoán'
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    disabled={feedback.includes('Chúc mừng') || feedback.includes('Bạn đã hết lượt')}
                />
                <Button onClick={handleGuess} disabled={feedback.includes('Chúc mừng') || feedback.includes('Bạn đã hết lượt')}>
                    Đoán
                </Button>
                <Button onClick={startNewGame} style={{ marginLeft: '10px' }}>
                    Chơi lại
                </Button>
                <div>{feedback}</div>
            </div>
        </Card>
    );
};

export default NumberGuessingGame;