import React, { useState } from 'react'
import { MdDoneOutline } from "react-icons/md";
import { LuPencilLine } from "react-icons/lu";
import { MdDeleteOutline } from "react-icons/md";
import { TfiSave } from "react-icons/tfi";
import { FaUndo } from "react-icons/fa";
import './to-do-item.css'
import { toast } from 'react-toastify';
import { hapticImpact, hapticNotification } from './hooks/useHaptics';
import { useDialog } from './components/Dialog/DialogContext';
import { playClickSound, playSuccessSound, playUpdateStartSound, playUpdateSuccessSound } from './hooks/useSounds';

const ToDoItem = ({index,todo,Delete_From_List,Update_List,Done,Undo,isSimple,hideDeleteToast}) => {

    const [isUpdating, setIsUpdating] = useState(false)
    const [InputValue,setInputValue] = useState(todo?.title || '')
    const { ask } = useDialog();
  return (
<div className={`To-Do-List ${todo.IsCompleted ? 'completed' : ''}`}>
    
    <div className="List_Items">
        {!isUpdating ? (
            <span>{`${index}) ${todo.title}`}</span>
        ) : (
            <textarea
                value={InputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                }}
                autoFocus
                onFocus={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                }}
                rows={1}
            />
        )}
        <div className="btn-group">
        {
            (() => {
                const completed = todo.IsCompleted === true;
                const handleDelete = async () => {
                    const confirmed = await ask(`Are you sure you want to delete task "${todo.title}"?`, {
                        title: 'Delete Task',
                        kind: 'warning'
                    });
                    if (confirmed) {
                        Delete_From_List(todo.id);
                        hapticNotification('error');
                        if (!hideDeleteToast) {
                            toast.error(`Task ${index} deleted.`, {theme:'colored',position:'top-center',draggable:false})
                        }
                    }
                };
                
                if (isSimple) {
                    return (
                        <>
                            {todo.IsCompleted && (
                                <button
                                    className="icon-btn delete"
                                    onClick={handleDelete}
                                >
                                    <MdDeleteOutline size={18} />
                                </button>
                            )}
                        </>
                    );
                }

                if (!completed) {
                    if (!isUpdating) {
                        return (
                            <>
                                <button
                                    className="icon-btn done"
                                    onClick={() => {
                                        Done(todo.id);
                                        hapticNotification('success');
                                        playSuccessSound();
                                        toast.success(`Task ${index} completed!`, {
                                            theme: 'colored',
                                            position: 'top-center',
                                            draggable: false,
                                        });
                                    }}
                                >
                                    <MdDoneOutline size={18} />
                                </button>
                                <button
                                    className="icon-btn edit"
                                    onClick={() => {
                                        setIsUpdating(true);
                                        hapticImpact('light');
                                        playUpdateStartSound();
                                    }}
                                >
                                    <LuPencilLine size={18} />
                                </button>
                            </>
                        );
                    } else {
                        return (
                            <button
                                className="icon-btn done"
                                onClick={() => {
                                    Update_List(todo.id, InputValue);
                                    hapticImpact('medium');
                                    playUpdateSuccessSound();
                                    setIsUpdating(false);
                                    toast.success(`Task ${index} updated!`, {
                                        theme: 'colored',
                                        position: 'top-center',
                                        draggable: false,
                                    });
                                }}
                            >
                                <TfiSave size={16} />
                            </button>
                        );
                    }
                } else {
                    return (
                        <>
                            <button
                                className="icon-btn delete"
                                onClick={handleDelete}
                            >
                                <MdDeleteOutline size={18} />
                            </button>
                            <button
                                className="icon-btn undo"
                                onClick={() => {
                                    Undo(todo.id);
                                    hapticImpact('light');
                                    playClickSound();
                                    toast.info(`Task ${index} undone.`, {
                                        theme: 'colored',
                                        position: 'top-center',
                                        draggable: false,
                                    });
                                }}
                            >
                                <FaUndo size={16} />
                            </button>
                        </>
                    );
                }
            })()
        }
        </div>
    </div>
</div>
  )
}

export default ToDoItem;
