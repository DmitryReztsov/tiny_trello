import React, {useEffect, useRef, useState} from 'react';
import {getDndObjects, getTasks, useTypedSelector} from '../../store/selectors';
import {Card} from '../../store/card/types';
import TaskPanel from '../TaskPanel/TaskPanel';
import TaskCreateForm from '../forms/TaskCreateForm/TaskCreateForm';
import Confirm from '../modals/Confirm/Confirm';
import {Task} from '../../store/task/types';
import {useDispatch} from 'react-redux';
import {patchTask} from '../../store/task/actions';
import {useImage} from '../../utils/hooks';
import {getNextOrder, isCard, isTask} from '../../utils/common';
import './CardPanel.scss';
import ObjectEditTitleForm from "../forms/ObjectEditTitleForm/ObjectEditTitleForm";
import {clearDNDObject} from "../../store/dnd/actions";

type CardPaneProps = {
    card: Card,
    removeCardHandler: (card: Card) => void,
    dragStart: (e: React.DragEvent<HTMLLIElement | HTMLDivElement>, card: Card, task?: Task) => void,
}

const CardPanel: React.FC<CardPaneProps> = ({card, removeCardHandler, dragStart}) => {
    const dispatch = useDispatch();
    const tasks = useTypedSelector(getTasks);
    const {dndTask, dndCard} = useTypedSelector(getDndObjects)

    const {icons} = useImage();
    const parentElem = useRef<HTMLDivElement>(null);

    // нужны для правильной обработки useEffect
    const [newTask, setNewTask] = useState<Task | null>(null);

    const [hasEditTitle, setHasEditTitle] = useState<boolean>(false);
    const openEditTitleForm = (): void => setHasEditTitle(true);
    const closeEditTitleForm = (): void => setHasEditTitle(false);

    const [hasConfirmModal, setHasConfirmModal] = useState<boolean>(false);
    const openConfirmModal = (): void => setHasConfirmModal(true);
    const closeConfirmModal = (): void => setHasConfirmModal(false);

    const [hasCreateForm, setHasCreateForm] = useState<boolean>(false);
    const openCreateFrom = (): void => setHasCreateForm(true);
    const closeCreateForm = (): void => setHasCreateForm(false);

    function taskDragOverHandler(e: React.DragEvent<HTMLLIElement>) {
        e.preventDefault();
        // Обязательно предотвращаем всплытие
        e.stopPropagation()
    }

    function taskDragLeaveHandler(e: React.DragEvent<HTMLLIElement>) {
        //e.currentTarget.className = "taskPanel"
    }

    function taskDragEndHandler(e: React.DragEvent<HTMLLIElement>) {
        //e.currentTarget.className = "taskPanel"
    }

    function taskDragEnterHandler(e: React.DragEvent<HTMLLIElement>, card: Card, task: Task) {
        // Обязательно предотвращаем всплытие
        e.stopPropagation()
        // Добавление эффектов при наведении на задачу
        e.currentTarget.className = "taskPanel shadowed"
        // Идет проверка условия, при котором будет определяться как перетасовываются карточки
        if (!isTask(dndTask)) return;
        if (dndCard === card && task.order > dndTask.order) {
            dispatch(patchTask({
                ...dndTask,
                cardId: card.id as number,
                order: task.order + 0.1,
            }))
        } else {
            dispatch(patchTask({
                ...dndTask,
                cardId: card.id as number,
                order: task.order - 0.1,
            }))
        }
        setNewTask(task)
    }

    function taskDropHandler(e: React.DragEvent<HTMLLIElement>) {
        e.preventDefault();
        // Чистим обязательно объект после отпускания мыши!
        dispatch(clearDNDObject())
    }

    // const cardDragStartHandler = (e: React.DragEvent<HTMLDivElement>, card: Card): void => {
    //     dispatch(clearDNDObject())
    //     dispatch(setDNDCard(card))
    //     console.log(1)
    // }

    const cardDragEnterHandler = (e: React.DragEvent<HTMLDivElement>, card: Card): void => {
        e.preventDefault();
        e.currentTarget.className = "cardPanel"
        if (!isTask(dndTask) || !isCard(dndCard)) return;
        if (dndCard === card) return;
        dispatch(patchTask({
            ...dndTask,
            cardId: card.id as number,
            order: getNextOrder<Task>(tasks.filter(task => task.cardId === card.id)),
        }));
    }

    function cardDragOverHandler(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }

    function cardDragLeaveHandler(e: React.DragEvent<HTMLDivElement>) {
        //e.currentTarget.className = "cardPanel"
    }

    function cardDragEndHandler(e: React.DragEvent<HTMLDivElement>) {
        //e.currentTarget.className = "cardPanel"
    }

    function cardDropHandler(e: React.DragEvent<HTMLDivElement>) {
        //e.currentTarget.className = "cardPanel"
    }

    // Очередь обновляется при каждой новой замененной таске
    useEffect(() => {
        if (!isTask(dndTask)) return;
        tasks.filter(task => task.cardId === card.id).sort((a, b) => a.order - b.order).map((task, i) => {
            return dispatch(patchTask({
                ...task,
                order: i,
            }))
        })
    }, [newTask])

    // Обертка для анимации при удалении Card
    const removeCardHandlerWrap = (card: Card): void => {
        closeConfirmModal();
        parentElem.current?.classList.add('animation_delete');
        setTimeout(() => removeCardHandler(card), 450);
    }

    const {id, title} = card;

    return (
        // Обработчики списка
        <div
            className="cardPanel"
            ref={parentElem}
            onDragStart={(e: React.DragEvent<HTMLLIElement | HTMLDivElement>) => dragStart(e, card)}
            onDragEnter={(e: React.DragEvent<HTMLDivElement>) => cardDragEnterHandler(e, card)}
            onDragOver={(e: React.DragEvent<HTMLDivElement>) => cardDragOverHandler(e)}
            onDragLeave={(e: React.DragEvent<HTMLDivElement>) => cardDragLeaveHandler(e)}
            onDragEnd={(e: React.DragEvent<HTMLDivElement>) => cardDragEndHandler(e)}
            onDrop={(e: React.DragEvent<HTMLDivElement>) => cardDropHandler(e)}
            draggable={true}
        >
            {hasEditTitle
                ? <ObjectEditTitleForm object={card} closeHandler={closeEditTitleForm}/>
                : <>
                    <p className="cardPanel__name" onClick={openEditTitleForm}>{title}</p>
                    <button className="cardPanel__delete" onClick={openConfirmModal}>
                        <img
                            className="cardPanel__icon_delete"
                            src={icons.iconRemove}
                            alt="delete"
                        />
                    </button>
                </>
            }

            {hasConfirmModal &&
            <Confirm
                text={`Удалить список "${title}"?`}
                buttonLabel={'Удалить'}
                cancelHandler={closeConfirmModal}
                acceptHandler={() => removeCardHandlerWrap(card)}
            />}

            <ul>
                {tasks
                    .filter(task => task.cardId === id)
                    .sort((a, b) => a.order - b.order)
                    .map(task =>
                        <TaskPanel
                            key={task.id}
                            task={task}
                            card={card}
                            // Обработчики задачи
                            dragOver={(e: React.DragEvent<HTMLLIElement>) => taskDragOverHandler(e)}
                            dragLeave={(e: React.DragEvent<HTMLLIElement>) => taskDragLeaveHandler(e)}
                            dragEnd={(e: React.DragEvent<HTMLLIElement>) => taskDragEndHandler(e)}
                            dragStart={dragStart}
                            drop={(e: React.DragEvent<HTMLLIElement>) => taskDropHandler(e)}
                            dragEnter={(e: React.DragEvent<HTMLLIElement>) => taskDragEnterHandler(e, card, task)}
                        />
                    )
                }
                {hasCreateForm ?
                    <TaskCreateForm card={card} closeHandler={closeCreateForm}/>
                    :
                    <li className="cardPanel__btn_add" onClick={openCreateFrom}>
                        <img
                            className="cardPanel__icon_add"
                            src={icons.iconAddTask}
                            alt="add"
                        />
                    </li>
                }
            </ul>
        </div>
    );
}

export default CardPanel;