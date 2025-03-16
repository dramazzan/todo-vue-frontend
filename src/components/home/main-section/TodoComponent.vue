<script setup>
import { ref, computed, onMounted } from "vue";
import api from '@/axios/caseApi';
import userApi from "@/axios/userApi";

const todos = ref([]);
const trashItems = ref([]);
const sortValue = ref("asc");
const searchQuery = ref("");
const activeFilter = ref("all");
const loading = ref(false);
const error = ref(null);
const user = ref(null);
const userId = ref(null)

const getUserData = async()=>{
    try{
        const response = await userApi.getUserData()
        console.log(response.data)
        if(response.success){
            user.value = response.data 
            userId.value = response.data.user._id
        }else{
            console.log(response)
        }
    }catch(error){
        error.value = "Error fetching user"
    }
}

// Fetch cases list from API
const getCasesList = async () => {
    loading.value = true;
    error.value = null;
    
    try {
        const response = await api.getCaseList();
        console.log('Cases response:', response);
        
        if (response.success) {
            // Format the data to match our app's structure and filter by current user
            todos.value = Array.isArray(response.data) 
                ? response.data
                    .filter(caseItem => caseItem.userId === userId.value) // Filter cases by current user ID
                    .map(formatCaseFromAPI) 
                : [];
        } else {
            error.value = response.message || 'Failed to fetch cases';
            console.error(error.value);
        }
    } catch (err) {
        error.value = 'An unexpected error occurred';
        console.error('API error:', err);
    } finally {
        loading.value = false;
    }
};

// Format case from API to match our app's structure
const formatCaseFromAPI = (caseItem) => {
    return {
        id: caseItem._id,
        title: caseItem.title,
        description: caseItem.description,
        status: caseItem.status || 'pending',
        favorite: caseItem.favorite || false,
        dueDate: new Date(caseItem.dueDate || new Date()),
        priority: caseItem.priority || 'medium',
        tags: caseItem.tags || [],
        createdAt: new Date(caseItem.createdAt),
        updatedAt: new Date(caseItem.updatedAt)
    };
};

// Load initial data on component mount
onMounted(() => {
    getCasesList();
    getUserData();
});

// Filter todos based on active filter
const filteredTodos = computed(() => {
  if (activeFilter.value === "all") {
    return todos.value;
  } else if (activeFilter.value === "favorite") {
    return todos.value.filter(todo => todo.favorite);
  } else if (activeFilter.value === "trash") {
    return trashItems.value;
  } else {
    return todos.value.filter(todo => todo.status === activeFilter.value);
  }
});

// Sort and search filtered todos
const sortedAndSearchedTodos = computed(() => {
  let result = [...filteredTodos.value];
  
  // Apply search filter if search query exists
  if (searchQuery.value.trim()) {
    result = result.filter(todo => 
      todo.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (todo.tags && todo.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase())))
    );
  }
  
  // Apply sorting
  result.sort((a, b) => {
    if (sortValue.value === "asc") {
      return a.title.localeCompare(b.title);
    } else if (sortValue.value === "desc") {
      return b.title.localeCompare(a.title);
    } else if (sortValue.value === "dueDate") {
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sortValue.value === "priority") {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortValue.value === "recent") {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
    return 0;
  });
  
  return result;
});

// Save todo to API
const saveTodo = async (todo) => {
    loading.value = true;
    error.value = null;
    
    try {
        const todoData = {
            title: todo.title,
            description: todo.description,
            status: todo.status,
            favorite: todo.favorite,
            dueDate: todo.dueDate,
            priority: todo.priority,
            tags: todo.tags
        };
        
        console.log('Saving todo to server:', todoData);
        
        let response;
        if (todo.id && todo.id !== 'new') {
            // Update existing todo
            response = await api.updateCase(todo.id, todoData);
            console.log('Update response:', response);
            
            if (response.success) {
                // Update the local todo with server data
                const index = todos.value.findIndex(t => t.id === todo.id);
                if (index !== -1 && response.updateCase) {
                    todos.value[index] = {
                        ...todo,
                        updatedAt: new Date(response.updateCase.updatedAt)
                    };
                }
            }
        } else {
            // Create new todo
            response = await api.createCase(todoData);
            console.log('Create response:', response);
            
            if (response.success && response.savedCase) {
                // If creating a new todo, we need to update the temporary ID
                const index = todos.value.findIndex(t => t === todo);
                if (index !== -1) {
                    todos.value[index] = formatCaseFromAPI(response.savedCase);
                }
            }
        }
        
        if (!response.success) {
            error.value = response.message || 'Failed to save todo';
            console.error(error.value);
            return false;
        }
        
        return true;
    } catch (err) {
        error.value = 'An unexpected error occurred';
        console.error('Error saving todo:', err);
        return false;
    } finally {
        loading.value = false;
    }
};

// Add this with other ref declarations at the top
const editingTodo = ref(null);

// Add this with your other functions
const startEditing = (todo) => {
  // Create a clone to avoid directly modifying the original object
  editingTodo.value = {
    ...todo,
    // Convert tags array to comma-separated string for editing
    tags: todo.tags ? todo.tags.join(', ') : ''
  };
};

// Add function to cancel editing
const cancelEditing = () => {
  editingTodo.value = null;
};

// Add function to save edited todo
const saveEditedTodo = async () => {
  if (editingTodo.value && editingTodo.value.title.trim()) {
    loading.value = true;
    error.value = null;
    
    try {
      // Format tags from string back to array
      const formattedTodo = {
        ...editingTodo.value,
        tags: editingTodo.value.tags 
          ? editingTodo.value.tags.split(',').map(tag => tag.trim()) 
          : []
      };
      
      const success = await saveTodo(formattedTodo);
      
      if (success) {
        // Close edit form
        editingTodo.value = null;
      }
    } catch (err) {
      error.value = 'An unexpected error occurred';
      console.error('Error updating todo:', err);
    } finally {
      loading.value = false;
    }
  }
};

// Change active filter
const setFilter = (filter) => {
  activeFilter.value = filter;
};

// Submit search
const submitSearch = () => {
  // Can be enhanced to use the API search endpoint
  if (searchQuery.value.trim().length > 2) {
    searchCasesFromAPI(searchQuery.value);
  }
};

// Search using API
const searchCasesFromAPI = async (query) => {
  if (!query.trim()) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const response = await api.searchCases(query);
    if (response.success && response.cases) {
      // Replace todos with search results
      todos.value = response.cases.map(formatCaseFromAPI);
    } else {
      error.value = response.message || 'No results found';
    }
  } catch (err) {
    error.value = 'Search failed. Please try again.';
    console.error('Search error:', err);
  } finally {
    loading.value = false;
  }
};

// Toggle favorite status
const toggleFavorite = async (todo) => {
  // Update locally first for immediate UI feedback
  todo.favorite = !todo.favorite;
  todo.updatedAt = new Date();
  
  // Then save to database
  const success = await saveTodo(todo);
  
  // If saving failed, revert the local change
  if (!success) {
    todo.favorite = !todo.favorite;
    todo.updatedAt = new Date();
  }
};

// Change todo status
const changeStatus = async (todo, status) => {
  // Update locally first for immediate UI feedback
  const oldStatus = todo.status;
  todo.status = status;
  todo.updatedAt = new Date();
  
  // Then save to database
  const success = await saveTodo(todo);
  
  // If saving failed, revert the local change
  if (!success) {
    todo.status = oldStatus;
    todo.updatedAt = new Date();
  }
};

// Change todo priority
const changePriority = async (todo, priority) => {
  // Update locally first for immediate UI feedback
  const oldPriority = todo.priority;
  todo.priority = priority;
  todo.updatedAt = new Date();
  
  // Then save to database
  const success = await saveTodo(todo);
  
  // If saving failed, revert the local change
  if (!success) {
    todo.priority = oldPriority;
    todo.updatedAt = new Date();
  }
};

// Move todo to trash
const moveToTrash = async (todo) => {
  // For now, we'll just use deletion
  // You could also add a "trash" status in your database if you want a recycle bin feature
  
  const index = todos.value.findIndex(t => t.id === todo.id);
  if (index !== -1) {
    const [removedTodo] = todos.value.splice(index, 1);
    trashItems.value.push(removedTodo);
    
    // You could implement a "soft delete" by changing a status field
    // For example: 
    // removedTodo.status = 'trash';
    // await saveTodo(removedTodo);
  }
};

// Restore from trash
const restoreFromTrash = async (todo) => {
  const index = trashItems.value.findIndex(t => t.id === todo.id);
  if (index !== -1) {
    const [restoredTodo] = trashItems.value.splice(index, 1);
    todos.value.push(restoredTodo);
    
    // If you implemented a "soft delete" by status:
    // restoredTodo.status = 'pending';
    // await saveTodo(restoredTodo);
  }
};

// Delete permanently
const deletePermanently = async (todo) => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await api.deleteCase(todo.id);
    
    if (response.success) {
      // Remove from trashItems if it's there
      const index = trashItems.value.findIndex(t => t.id === todo.id);
      if (index !== -1) {
        trashItems.value.splice(index, 1);
      }
      
      // Also remove from todos if it's there
      const todoIndex = todos.value.findIndex(t => t.id === todo.id);
      if (todoIndex !== -1) {
        todos.value.splice(todoIndex, 1);
      }
    } else {
      error.value = response.message || 'Failed to delete todo';
      console.error(error.value);
    }
  } catch (err) {
    error.value = 'An unexpected error occurred';
    console.error('Error deleting todo:', err);
  } finally {
    loading.value = false;
  }
};

// Add new todo
const addTodo = async () => {
  if (newTodo.value.title.trim()) {
    loading.value = true;
    error.value = null;
    
    try {
      const todoData = {
        title: newTodo.value.title,
        description: newTodo.value.description,
        status: newTodo.value.status,
        priority: newTodo.value.priority,
        dueDate: new Date(newTodo.value.dueDate),
        tags: newTodo.value.tags ? newTodo.value.tags.split(',').map(tag => tag.trim()) : []
      };
      
      const response = await api.createCase(todoData);
      
      if (response.success && response.savedCase) {
        todos.value.push(formatCaseFromAPI(response.savedCase));
        
        // Reset form
        newTodo.value = {
          title: "",
          description: "",
          status: "pending",
          priority: "medium",
          dueDate: new Date().toISOString().split('T')[0],
          tags: ""
        };
        
        // Hide form
        showNewTaskForm.value = false;
      } else {
        error.value = response.message || 'Failed to create todo';
        console.error(error.value);
      }
    } catch (err) {
      error.value = 'An unexpected error occurred';
      console.error('Error creating todo:', err);
    } finally {
      loading.value = false;
    }
  }
};

// Format date for display
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

// Toggle new task form visibility
const showNewTaskForm = ref(false);

// Add new todo template
const newTodo = ref({
  title: "",
  description: "",
  status: "pending",
  priority: "medium",
  dueDate: new Date().toISOString().split('T')[0],
  tags: ""
});
</script>

<template>
  <main>
  
    <div class="todo-main-container">
      <div class="todo-header">
        <div class="todo-title-box">
          <button 
            class="filter-btn" 
            :class="{ active: activeFilter === 'all' }"
            @click="setFilter('all')"
          >
            <i class="icon-all"></i>All
          </button>
          <button 
            class="filter-btn" 
            :class="{ active: activeFilter === 'favorite' }"
            @click="setFilter('favorite')"
          >
            <i class="icon-star"></i>Favorite
          </button>
          <button 
            class="filter-btn" 
            :class="{ active: activeFilter === 'pending' }"
            @click="setFilter('pending')"
          >
            <i class="icon-clock"></i>Pending
          </button>
          <button 
            class="filter-btn" 
            :class="{ active: activeFilter === 'in-progress' }"
            @click="setFilter('in-progress')"
          >
            <i class="icon-progress"></i>In-progress
          </button>
          <button 
            class="filter-btn" 
            :class="{ active: activeFilter === 'completed' }"
            @click="setFilter('completed')"
          >
            <i class="icon-check"></i>Completed
          </button>
          <button 
            class="filter-btn" 
            :class="{ active: activeFilter === 'trash' }"
            @click="setFilter('trash')"
          >
            <i class="icon-trash"></i>Trash
          </button>
        </div>
        <div class="todo-actions">
          <div class="search-box">
            <form @submit.prevent="submitSearch">
              <input 
                type="text" 
                class="search-input" 
                placeholder="Search tasks or tags..."
                v-model="searchQuery" 
              />
              <button type="submit" class="search-button">
                <i class="icon-search"></i>
              </button>
            </form>
          </div>
          <div class="sort-box">
            <select v-model="sortValue" class="sort-select">
              <option value="asc">A to Z</option>
              <option value="desc">Z to A</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="recent">Recently Updated</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="add-todo-section">
        <button 
          @click="showNewTaskForm = !showNewTaskForm" 
          class="toggle-form-btn"
        >
          {{ showNewTaskForm ? 'Hide Form' : 'Add New Task' }}
        </button>
        
        <form 
          v-if="showNewTaskForm"
          @submit.prevent="addTodo" 
          class="add-todo-form"
        >
          <div class="form-row">
            <input 
              type="text" 
              v-model="newTodo.title" 
              placeholder="Task title *" 
              class="add-todo-input"
              required
            />
          </div>
          
          <div class="form-row">
            <textarea 
              v-model="newTodo.description" 
              placeholder="Task description *" 
              class="add-todo-textarea"
              required
            ></textarea>
          </div>
          
          <div class="form-row form-grid">
            <div class="form-group">
              <label>Due Date:</label>
              <input 
                type="date" 
                v-model="newTodo.dueDate" 
                class="add-todo-input"
              />
            </div>
            
            <div class="form-group">
              <label>Priority:</label>
              <select v-model="newTodo.priority" class="add-todo-select">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Status:</label>
              <select v-model="newTodo.status" class="add-todo-select">
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <input 
              type="text" 
              v-model="newTodo.tags" 
              placeholder="Tags (comma separated)" 
              class="add-todo-input"
            />
          </div>
          
          <div class="form-row">
            <button type="submit" class="add-todo-button">Add Task</button>
          </div>
        </form>
      </div>
      
      <div class="todo-body">
        <div v-if="sortedAndSearchedTodos.length === 0" class="empty-state">
          <p>No tasks found. Add a new task or change filters.</p>
        </div>
        
    
<div v-if="editingTodo" class="edit-todo-overlay">
  <div class="edit-todo-modal">
    <h3>Edit Task</h3>
    
    <form @submit.prevent="saveEditedTodo" class="edit-todo-form">
      <div class="form-row">
        <input 
          type="text" 
          v-model="editingTodo.title" 
          placeholder="Task title *" 
          class="add-todo-input"
          required
        />
      </div>
      
      <div class="form-row">
        <textarea 
          v-model="editingTodo.description" 
          placeholder="Task description *" 
          class="add-todo-textarea"
          required
        ></textarea>
      </div>
      
      <div class="form-row form-grid">
        <div class="form-group">
          <label>Due Date:</label>
          <input 
            type="date" 
            v-model="editingTodo.dueDate" 
            class="add-todo-input"
          />
        </div>
        
        <div class="form-group">
          <label>Priority:</label>
          <select v-model="editingTodo.priority" class="add-todo-select">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Status:</label>
          <select v-model="editingTodo.status" class="add-todo-select">
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
      <div class="form-row">
        <input 
          type="text" 
          v-model="editingTodo.tags" 
          placeholder="Tags (comma separated)" 
          class="add-todo-input"
        />
      </div>
      
      <div class="form-actions">
        <button type="button" @click="cancelEditing" class="cancel-button">Cancel</button>
        <button type="submit" class="save-button">Save Changes</button>
      </div>
    </form>
  </div>
</div>

        <ul v-else class="todo-list">
          <li 
            v-for="todo in sortedAndSearchedTodos" 
            :key="todo.id" 
            class="todo-item" 
            :class="[todo.status, `priority-${todo.priority}`]"
          >
            <div class="todo-content">
              <div class="todo-header-row">
                <h3 class="todo-title">{{ todo.title }}</h3>
                <div class="todo-meta">
                  <span class="todo-due-date">Due: {{ formatDate(todo.dueDate) }}</span>
                  <span 
                    class="todo-priority" 
                    :class="`priority-${todo.priority}`"
                  >
                    {{ todo.priority }}
                  </span>
                </div>
              </div>
              
              <p class="todo-description">{{ todo.description }}</p>
              
              <div class="todo-footer">
                <div class="todo-status-badge" :class="todo.status">
                  {{ todo.status }}
                </div>
                
                <div class="todo-tags" v-if="todo.tags && todo.tags.length">
                  <span 
                    v-for="(tag, index) in todo.tags" 
                    :key="index"
                    class="todo-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="todo-actions">
              <template v-if="activeFilter !== 'trash'">
                <button 
                  @click="toggleFavorite(todo)" 
                  class="action-btn favorite-btn"
                  :class="{ active: todo.favorite }"
                  title="Toggle favorite"
                >
                  <i class="icon-star"></i>
                </button>
                
                <div class="status-dropdown">
                  <button class="action-btn status-dropdown-btn" title="Change status">
                    <i class="icon-status"></i>
                  </button>
                  <div class="status-dropdown-content">
                    <button @click="changeStatus(todo, 'pending')">Pending</button>
                    <button @click="changeStatus(todo, 'in-progress')">In Progress</button>
                    <button @click="changeStatus(todo, 'completed')">Completed</button>
                  </div>
                </div>
                
                <div class="priority-dropdown">
                  <button class="action-btn priority-dropdown-btn" title="Change priority">
                    <i class="icon-priority"></i>
                  </button>
                  <div class="priority-dropdown-content">
                    <button @click="changePriority(todo, 'low')">Low</button>
                    <button @click="changePriority(todo, 'medium')">Medium</button>
                    <button @click="changePriority(todo, 'high')">High</button>
                  </div>
                </div>

                <button 
                    @click="startEditing(todo)" 
                    class="action-btn edit-btn"
                    title="Edit task"
                >
                    <i class="icon-edit"></i>
                </button>
                                
                <button 
                  @click="moveToTrash(todo)" 
                  class="action-btn trash-btn"
                  title="Move to trash"
                >
                  <i class="icon-trash"></i>
                </button>
              </template>
              
              <template v-else>
                <button 
                  @click="restoreFromTrash(todo)" 
                  class="action-btn restore-btn"
                  title="Restore"
                >
                  <i class="icon-restore"></i>
                </button>
                <button 
                  @click="deletePermanently(todo)" 
                  class="action-btn delete-btn"
                  title="Delete permanently"
                >
                  <i class="icon-delete"></i>
                </button>
              </template>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </main>
</template>

<style >


button {
  cursor: pointer;
}



/* Main container */
.todo-main-container {
    font-family: 'Raleway' , sans-serif;
  max-width: 80%;
  margin: 2rem auto;
  background: var(--background-color);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Header styles */
.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--background-color);
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: 1rem;
}

.todo-title-box {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  color: #64748b;
  transition: all 0.2s ease;
  font-weight: 500;
  
}

.filter-btn:hover {
  background-color: var(--hover-color);
  color: var(--primary-color);
}

.filter-btn.active {
  background-color: rgba(74, 108, 247, 0.1);
  color: var(--primary-color);
}

/* Search & Sort */
.todo-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  width: 200px;
  transition: all 0.2s ease;
  background: var(--input-background-color);
  color:var(--input-text-color)
}

.search-input::placeholder{
    color: var(--placeholder-color)
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.2);
  width: 220px;
}

.search-button {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
}

.sort-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--input-background-color);
  color: var(--placeholder-color)
}

/* Add todo section */
.add-todo-section {
  padding: 1rem 1.5rem;
  background-color: var(--background-color);
  border-bottom: 1px solid var(--border-color);
}

.toggle-form-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.toggle-form-btn:hover {
  background-color: #3c58d9;
}

.add-todo-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--background-color);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row:last-child {
  justify-content: flex-end;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group label {
  font-size: 0.875rem;
  color: #64748b;
}

.add-todo-input,
.add-todo-textarea,
.add-todo-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  width: 100%;
  background: var(--input-background-color);
    color: var(--input-text-color);
}

.add-todo-input[type = date]{
    width: 90%;
}

.add-todo-input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(50%) sepia(3%) saturate(250%) hue-rotate(180deg);
    cursor: pointer;
}



.add-todo-textarea {
  min-height: 80px;
  resize: vertical;
}

.add-todo-input:focus,
.add-todo-textarea:focus,
.add-todo-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.2);
}

.add-todo-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.add-todo-button:hover {
  background-color: #3c58d9;
}

/* Todo list */
.todo-body {
  padding: 1rem 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: #64748b;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.todo-item:hover {
  background-color: var(--hover-color);
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
  color: #64748b;
}

.todo-item.priority-low {
  border-left-color: var(--low-color);
}

.todo-item.priority-medium {
  border-left-color: var(--medium-color);
}

.todo-item.priority-high {
  border-left-color: var(--high-color);
}

.todo-content {
  flex: 1;
  margin-right: 1rem;
}

.todo-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.todo-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.todo-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
}

.todo-due-date {
  color: #64748b;
}

.todo-priority {
  text-transform: uppercase;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.todo-priority.priority-low {
  color: var(--low-color);
  background-color: rgba(16, 185, 129, 0.1);
}

.todo-priority.priority-medium {
  color: var(--medium-color);
  background-color: rgba(245, 158, 11, 0.1);
}

.todo-priority.priority-high {
  color: var(--high-color);
  background-color: rgba(239, 68, 68, 0.1);
}

.todo-description {
  margin: 0.5rem 0;
  color: #4b5563;
  font-size: 0.875rem;
}

.todo-footer {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.todo-status-badge {
  font-size: 0.75rem;
  text-transform: capitalize;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  display: inline-block;
}

.todo-status-badge.pending {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.todo-status-badge.in-progress {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--info-color);
}

.todo-status-badge.completed {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.todo-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.todo-tag {
  background-color: #e5e7eb;
  color: #4b5563;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

/* Action buttons */
.todo-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  color: #64748b;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: var(--hover-color);
  color: var(--dark-color);
}

.favorite-btn.active {
  color: var(--warning-color);
}

.trash-btn:hover, .delete-btn:hover {
  color: var(--danger-color);
}

.restore-btn:hover {
  color: var(--success-color);
}

/* Status dropdown */
.status-dropdown,
.priority-dropdown {
  position: relative;
  display: inline-block;
}

.status-dropdown-content,
.priority-dropdown-content {
  display: none;
  position: absolute;
  right: 0;
  z-index: 1;
  background-color: white;
  min-width: 120px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.status-dropdown-content button,
.priority-dropdown-content button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  transition: all 0.2s ease;
}

.status-dropdown-content button:hover,
.priority-dropdown-content button:hover {
  background-color: var(--hover-color);
}

.status-dropdown:hover .status-dropdown-content,
.priority-dropdown:hover .priority-dropdown-content {
  display: block;
}

/* Icons */
.icon-all::before { content: "📋"; }
.icon-star::before { content: "★"; }
.icon-clock::before { content: "⏱"; }
.icon-progress::before { content: "🔄"; }
.icon-check::before { content: "✓"; }
.icon-trash::before { content: "🗑"; }
.icon-search::before { content: "🔍"; }
.icon-status::before { content: "⚙️"; }
.icon-priority::before { content: "🔥"; }
.icon-restore::before { content: "↩"; }
.icon-delete::before { content: "❌"; }
.icon-edit::before { content: "✏️"; }

.edit-todo-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.edit-todo-modal {
  background-color: var(--background-color);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.edit-todo-modal h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.edit-todo-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.cancel-button {
  background-color: #d5d5d8;
  color: #545960;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background-color: #d1d5db;
}

.save-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.save-button:hover {
  background-color: #3c58d9;
}

/* Responsive styles */
@media (max-width: 768px) {
  .todo-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .todo-title-box {
    justify-content: center;
  }
  
  .todo-actions {
    justify-content: center;
  }
  
  .search-input {
    width: 100%;
  }
  
  .todo-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .todo-content {
    width: 100%;
    margin-right: 0;
  }
  
  .todo-header-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .todo-item .todo-actions {
    align-self: flex-end;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>