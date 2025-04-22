import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from './api';

type Task = {
  id: number;
  title: string;
  completed: boolean;
};

export default function TodoApp(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks/');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const addTask = async () => {
    if (!title.trim()) return;

    const newTask = {
      title: title.trim(),
      completed: false,
    };

    try {
      const response = await api.post('/tasks/', newTask);
      console.log('Task added:', response.data);
      setTasks([response.data, ...tasks]);
      setTitle('');
    } catch (error: any) {
      console.error('Error adding task:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error config:', error.config);
      }
    }
  };

  const toggleComplete = async (id: number) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      const updatedTask = { ...task, completed: !task.completed };
      await api.patch(`/tasks/${id}/`, { completed: updatedTask.completed });
      setTasks(tasks.map(t => (t.id === id ? updatedTask : t)));
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}/`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const editTask = async (id: number, newTitle: string) => {
    try {
      await api.patch(`/tasks/${id}/`, { title: newTitle });
      setTasks(tasks.map(t => (t.id === id ? { ...t, title: newTitle } : t)));
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };

  const saveEdit = (): void => {
    if (editingId !== null && editingText.trim()) {
      editTask(editingId, editingText.trim());
      setEditingId(null);
      setEditingText('');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const getButtonStyle = () => ({
    backgroundColor: darkMode ? '#ffcade' : '#521336',
  });

  const getTextStyle = () => ({
    color: darkMode ? '#521336' : '#ffcade',
  });

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#521336' : '#ffcade' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDarkMode(!darkMode)}>
          <Ionicons
            name={darkMode ? 'sunny' : 'moon'}
            size={32}
            color={darkMode ? '#ffcade' : '#521336'}
          />
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, { color: darkMode ? '#ffcade' : '#521336' }]}
        placeholder="Add new task"
        placeholderTextColor={darkMode ? '#ffcade' : '#521336'}
        value={title}
        onChangeText={setTitle}
      />
      <TouchableOpacity style={[styles.customButton, getButtonStyle()]} onPress={addTask}>
        <Text style={[styles.buttonText, getTextStyle()]}>Add Task</Text>
      </TouchableOpacity>

      <View style={styles.filters}>
        {['all', 'pending', 'completed'].map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f as 'all' | 'pending' | 'completed')}
            style={[styles.customButton, getButtonStyle()]}
          >
            <Text style={[styles.buttonText, getTextStyle()]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <View style={styles.taskItem}>
              <TouchableOpacity onPress={() => toggleComplete(item.id)}>
                <Ionicons
                  name={item.completed ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={darkMode ? '#ffcade' : '#521336'}
                  style={{ marginRight: 11 }}
                />
              </TouchableOpacity>

              {editingId === item.id ? (
                <TextInput
                  value={editingText}
                  onChangeText={setEditingText}
                  style={[
                    styles.editInput,
                    {
                      color: darkMode ? '#ffcade' : '#521336',
                      borderBottomColor: darkMode ? '#ffcade' : '#521336',
                    },
                  ]}
                  onSubmitEditing={saveEdit}
                />
              ) : (
                <Text
                  style={[
                    styles.taskText,
                    {
                      textDecorationLine: item.completed ? 'line-through' : 'none',
                      color: darkMode ? '#ffcade' : '#521336',
                    },
                  ]}
                >
                  {item.title}
                </Text>
              )}
            </View>

            <View style={styles.buttonsRow}>
              {editingId === item.id ? (
                <TouchableOpacity
                  style={[styles.customButton, getButtonStyle(), { marginRight: 6 }]}
                  onPress={saveEdit}
                >
                  <Text style={[styles.buttonText, getTextStyle()]}>Save</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.customButton, getButtonStyle(), { marginRight: 6 }]}
                  onPress={() => {
                    setEditingId(item.id);
                    setEditingText(item.title);
                  }}
                >
                  <Text style={[styles.buttonText, getTextStyle()]}>Edit</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.customButton, getButtonStyle()]}
                onPress={() => deleteTask(item.id)}
              >
                <Text style={[styles.buttonText, getTextStyle()]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 12,
    fontSize: 18,
    paddingVertical: 4,
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  taskContainer: {
    marginVertical: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  taskText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  editInput: {
    flex: 1,
    fontSize: 18,
    borderBottomWidth: 1,
    marginRight: 12,
    paddingVertical: 2,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 1,
    marginLeft: 35,
  },
  customButton: {
    paddingVertical: 8,
    paddingHorizontal: 23,
    borderRadius: 7,
    marginVertical: 2,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
