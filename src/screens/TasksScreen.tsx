import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { GradientContainer } from '../components/GradientContainer';
import { COLORS } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getTasks, createTask, updateTask, deleteTask } from '../api/supabase';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

export const TasksScreen = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
    });

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await getTasks(user.id);
        if (data) setTasks(data);
        setLoading(false);
    };

    const handleCreateOrUpdate = async () => {
        if (!user || !formData.title.trim()) {
            Alert.alert('Error', 'Title is required');
            return;
        }

        if (editingTask) {
            const { error } = await updateTask(editingTask.id, formData);
            if (error) Alert.alert('Error', error.message);
        } else {
            const { error } = await createTask(user.id, formData);
            if (error) Alert.alert('Error', error.message);
        }

        setModalVisible(false);
        resetForm();
        loadTasks();
    };

    const handleDelete = async (taskId: string) => {
        Alert.alert('Delete Task', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteTask(taskId);
                    loadTasks();
                },
            },
        ]);
    };

    const toggleStatus = async (task: any) => {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        // Optimistic update
        const updatedTasks = tasks.map(t =>
            t.id === task.id ? { ...t, status: newStatus, completed: newStatus === 'done' } : t
        );
        setTasks(updatedTasks);

        await updateTask(task.id, { status: newStatus, completed: newStatus === 'done' });
        loadTasks();
    };

    const openModal = (task?: any) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                description: task.description || '',
                priority: task.priority,
                status: task.status,
            });
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingTask(null);
        setFormData({ title: '', description: '', priority: 'medium', status: 'todo' });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return '#EF4444';
            case 'high': return '#F59E0B';
            case 'medium': return '#3B82F6';
            case 'low': return '#10B981';
            default: return '#6B7280';
        }
    };

    const renderTask = ({ item }: any) => {
        const isDone = item.status === 'done';
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.taskCard, isDone && styles.taskCardDone]}
                onPress={() => openModal(item)}
            >
                <TouchableOpacity
                    style={[styles.checkbox, isDone && styles.checkboxDone]}
                    onPress={() => toggleStatus(item)}
                >
                    {isDone && <Ionicons name="checkmark" size={14} color="white" />}
                </TouchableOpacity>

                <View style={styles.taskContent}>
                    <Text style={[styles.taskTitle, isDone && styles.textDone]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    {item.description ? (
                        <Text style={[styles.taskDesc, isDone && styles.textDone]} numberOfLines={1}>
                            {item.description}
                        </Text>
                    ) : null}
                </View>

                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                        {item.priority}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id)}
                >
                    <Ionicons name="trash-outline" size={18} color={COLORS.ERROR} style={{ opacity: 0.6 }} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <GradientContainer>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Tasks</Text>
                    <Text style={styles.headerSubtitle}>{tasks.filter(t => t.status === 'todo').length} pending</Text>
                </View>
                <View style={styles.headerIcon}>
                    <Ionicons name="calendar-outline" size={24} color={COLORS.PRIMARY} />
                </View>
            </View>

            {loading && tasks.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                </View>
            ) : (
                <FlatList
                    data={tasks}
                    renderItem={renderTask}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="file-tray-outline" size={64} color={COLORS.TEXT_SECONDARY} style={{ opacity: 0.3 }} />
                            <Text style={styles.emptyText}>No tasks yet</Text>
                            <Text style={styles.emptySubtext}>Tap + to create your first task</Text>
                        </View>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={() => openModal()}
            >
                <LinearGradient
                    colors={[COLORS.PRIMARY, '#2563EB']}
                    style={styles.fabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons name="add" size={32} color="white" />
                </LinearGradient>
            </TouchableOpacity>

            {/* Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingTask ? 'Edit Task' : 'New Task'}</Text>
                            <TouchableOpacity onPress={() => {
                                setModalVisible(false);
                                resetForm();
                            }}>
                                <Ionicons name="close-circle" size={28} color={COLORS.TEXT_SECONDARY} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="What needs to be done?"
                                placeholderTextColor={COLORS.TEXT_SECONDARY}
                                value={formData.title}
                                onChangeText={(text) => setFormData({ ...formData, title: text })}
                                autoFocus
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Add details..."
                                placeholderTextColor={COLORS.TEXT_SECONDARY}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Priority</Text>
                            <View style={styles.priorityRow}>
                                {['low', 'medium', 'high', 'urgent'].map((p) => (
                                    <TouchableOpacity
                                        key={p}
                                        style={[
                                            styles.priorityPill,
                                            formData.priority === p && { backgroundColor: getPriorityColor(p) }
                                        ]}
                                        onPress={() => setFormData({ ...formData, priority: p })}
                                    >
                                        <Text style={[
                                            styles.priorityPillText,
                                            formData.priority === p ? { color: 'white' } : { color: COLORS.TEXT_SECONDARY }
                                        ]}>
                                            {p}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleCreateOrUpdate}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[COLORS.PRIMARY, '#2563EB']}
                                style={styles.saveGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.saveBtnText}>{editingTask ? 'Update Task' : 'Create Task'}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </GradientContainer>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTitle: { fontSize: 32, fontWeight: '800', color: COLORS.TEXT_PRIMARY },
    headerSubtitle: { fontSize: 14, color: COLORS.TEXT_SECONDARY, marginTop: 4, fontWeight: '500' },
    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    list: { padding: 24, paddingTop: 0, paddingBottom: 100 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: COLORS.TEXT_PRIMARY, fontSize: 18, fontWeight: '600', marginTop: 16 },
    emptySubtext: { color: COLORS.TEXT_SECONDARY, fontSize: 14, marginTop: 8 },

    // Task Card
    taskCard: {
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    taskCardDone: { opacity: 0.6 },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.TEXT_SECONDARY,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    checkboxDone: { backgroundColor: COLORS.SUCCESS, borderColor: COLORS.SUCCESS },
    taskContent: { flex: 1, marginRight: 12 },
    taskTitle: { fontSize: 16, color: COLORS.TEXT_PRIMARY, fontWeight: '600' },
    taskDesc: { fontSize: 13, color: COLORS.TEXT_SECONDARY, marginTop: 4 },
    textDone: { textDecorationLine: 'line-through', color: COLORS.TEXT_SECONDARY },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        minWidth: 60,
        alignItems: 'center'
    },
    priorityText: { fontSize: 10, textTransform: 'uppercase', fontWeight: '700' },
    deleteBtn: { marginLeft: 12, padding: 4 },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1E293B',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 50,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, color: COLORS.TEXT_SECONDARY, marginBottom: 8, fontWeight: '600' },
    input: {
        backgroundColor: COLORS.BACKGROUND,
        color: COLORS.TEXT_PRIMARY,
        padding: 16,
        borderRadius: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    priorityRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    priorityPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: COLORS.BACKGROUND,
    },
    priorityPillText: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
    saveBtn: {
        marginTop: 10,
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    saveGradient: {
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
    },
    saveBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
