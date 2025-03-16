<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  position: {
    type: Object,
    default: () => ({ top: 0, left: 0 }),
  },
});

const emit = defineEmits(["close", "confirm"]);

const handleClose = () => {
  emit("close");
};

const handleConfirm = () => {
  emit("confirm");
};

const handleClickOutside = (event) => {
  if (event.target.classList.contains("popup-overlay")) {
    handleClose();
  }
};
</script>

<template>
  <div v-if="visible" class="popup-overlay" @click="handleClickOutside">
    <div
      class="popup"
      :style="{
        top: `${position.top + 10}px`,
        left: `${position.left}px`,
      }"
    >
      <div class="popup-content">
        <p>Are you sure you want to exit?</p>
        <div class="popup-actions">
          <button class="cancel-btn" @click="handleClose">Cancel</button>
          <button class="confirm-btn" @click="handleConfirm">Logout</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  z-index: 100;
}

.popup {
  position: absolute;
  background-color: white;
  color: #000;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 15px;
  z-index: 101;
  min-width: 200px;
}

.popup-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  background-color: #f1f1f1;
  border: none;
  padding: 8px 12px;
  border-radius: 3px;
  cursor: pointer;
}

.confirm-btn {
  background-color: #de2a2a;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 3px;
  cursor: pointer;
}

.confirm-btn:hover {
  background-color: #c62222;
}
</style>
