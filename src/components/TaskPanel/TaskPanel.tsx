import React, {useState} from 'react';
import {Importance, Task} from '../../store/task/types';
import './TaskPanel.scss';
import {Card} from "../../store/card/types";
import {removeTask} from "../../store/task/actions";
import {useDispatch} from "react-redux";
import Confirm from "../modals/Confirm/Confirm";

type TaskPanelProps = {
    task: Task,
    card: Card,
    dragOver: (e: React.DragEvent<HTMLLIElement>) => void,
    dragLeave: (e: React.DragEvent<HTMLLIElement>) => void,
    dragEnd: (e: React.DragEvent<HTMLLIElement>) => void,
    dragStart: (e: React.DragEvent<HTMLLIElement>, card: Card, task: Task) => void,
    drop: (e: React.DragEvent<HTMLLIElement>) => void,
    dragEnter: (e: React.DragEvent<HTMLLIElement>, card: Card, task: Task) => void,
}

const TaskPanel: React.FC<TaskPanelProps> = ({task, card, dragOver, dragLeave, dragEnd, dragStart, drop, dragEnter}) => {

    const dispatch = useDispatch()
    const IMPORTANCE_TEXT_SELECTOR = {
        [Importance.Low]: 'Не высокая',
        [Importance.Medium]: 'Средняя',
        [Importance.High]: 'Высокая'
    }

    const [modalMode, setModalMode] = useState<boolean>(false);

    const getFormattedDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        const d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        const m = date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
        const y = date.getFullYear();
        return `${d}.${m}.${y}`
    }

    const removeTaskHandler = (task: Task): void => {
        dispatch(removeTask(task));
    }

    const {text, done, importance, deadline, order} = task;
    return (
        <li className="task_panel"
            draggable={true}
            onDragOver={dragOver}
            onDragLeave={dragLeave}
            onDragEnd={dragEnd}
            onDragStart={(e: React.DragEvent<HTMLLIElement>) => dragStart(e, card, task)}
            onDrop={drop}
            onDragEnter={(e: React.DragEvent<HTMLLIElement>) => dragEnter(e, card, task)}
        >
            {modalMode &&
            <Confirm
                text={`Действительно удалить задачу "${text}"?`}
                buttonLabel={'Удалить'}
                cancelHandler={() => setModalMode(false)}
                acceptHandler={() => removeTaskHandler(task)}
            />}
            <button className='task_delete' onClick={() => setModalMode(true)}>x</button>
            <h1 className="task_header">{text}</h1>
            <h2>{done ? 'Выполнено' : 'Не выполнено'}</h2>
            <h2>Важность: {IMPORTANCE_TEXT_SELECTOR[importance]}</h2>
            <h2>Срок: {getFormattedDate(deadline)}</h2>
            <p>Очередь {order}</p>
        </li>
    );
};

export default TaskPanel;