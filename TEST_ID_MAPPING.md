# Test ID Mapping - Excel Formal vs Implementación Actual

## 📋 Mapeo de IDs para Alineación

### **Smoke Tests**
| Excel Formal | Implementación Actual | Estado | Archivo |
|-------------|---------------------|--------|---------|
| SMK-01 | TC-01 | ✅ Mapeado | auth.spec.js |
| SMK-02 | TC-11 | ✅ Mapeado | dashboard.spec.js |
| SMK-03 | TC-13 | ✅ Mapeado | connection.spec.js |
| SMK-04 | TC-17 | ✅ Mapeado | message-monitoring.spec.js |
| SMK-05 | TC-10 | ✅ Mapeado | dashboard.spec.js |

### **Authentication Tests**
| Excel Formal | Implementación Actual | Estado | Archivo |
|-------------|---------------------|--------|---------|
| AUT-01 | TC-01 | ✅ Mapeado | auth.spec.js |
| AUT-02 | TC-02 | ✅ Mapeado | auth.spec.js |
| AUT-03 | TC-03 | ✅ Mapeado | auth.spec.js |
| AUT-04 | TC-04 | ✅ Mapeado | auth.spec.js |
| AUT-05 | TC-02 | ✅ Mapeado | auth.spec.js |
| AUT-06 | TC-02 | ✅ Mapeado | auth.spec.js |

### **Connection Tests**
| Excel Formal | Implementación Actual | Estado | Archivo |
|-------------|---------------------|--------|---------|
| CON-01 | TC-13 | ✅ Mapeado | connection.spec.js |
| CON-02 | TC-14 | ✅ Mapeado | connection.spec.js |
| CON-03 | TC-15 | ✅ Mapeado | connection.spec.js |
| CON-04 | TC-16 | ✅ Mapeado | connection.spec.js |
| CON-05 | TC-15 | ✅ Mapeado | connection.spec.js |
| CON-06 | TC-16 | ✅ Mapeado | connection.spec.js |

### **Message Tests**
| Excel Formal | Implementación Actual | Estado | Archivo |
|-------------|---------------------|--------|---------|
| MSG-01 | TC-17 | ✅ Mapeado | message-monitoring.spec.js |
| MSG-02 | TC-18 | ✅ Mapeado | message-monitoring.spec.js |
| MSG-03 | TC-20 | ✅ Mapeado | message-monitoring.spec.js |
| MSG-04 | TC-17 | ✅ Mapeado | message-monitoring.spec.js |

### **Tests Faltantes (Por Implementar)**
| Excel Formal | Descripción | Prioridad | Archivo Target |
|-------------|-------------|-----------|----------------|
| CIP-01 | Open image preview modal from chat | Alta | chat-image-preview.spec.js |
| CIP-02 | Close image preview modal | Alta | chat-image-preview.spec.js |
| CIP-03 | Preview keyboard/esc support | Alta | chat-image-preview.spec.js |
| FLG-01 | Flagged placeholder "Click to view text" | Media | flagged-messages.spec.js |
| FLG-02 | Flagged AI explanation expand | Media | flagged-messages.spec.js |
| FLG-03 | Flagged feedback Helpful | Media | flagged-messages.spec.js |
| FLG-04 | Flagged feedback Not Helpful | Media | flagged-messages.spec.js |
| FLG-05 | Flagged efficient counting | Alta | flagged-messages.spec.js |
| NOT-01 | Register current device (push) | Baja | notifications.spec.js |
| NOT-02 | Send test notification | Baja | notifications.spec.js |
| NOT-03 | Email notifications toggle | Media | notifications.spec.js |
| NOT-04 | Notification preferences | Media | notifications.spec.js |
| SPF-01 | View user profile | Media | profile-settings.spec.js |
| SPF-02 | Update display name | Media | profile-settings.spec.js |
| SAC-01 | Change password success | Media | account-settings.spec.js |
| SAC-02 | Change password invalidates sessions | Media | account-settings.spec.js |
| SAC-03 | Account deletion | Baja | account-settings.spec.js |

## 🎯 Plan de Implementación

### **Fase 1: Alineación (Actual)**
1. ✅ Crear mapeo de IDs
2. 🔄 Actualizar workflows con IDs correctos
3. 🔄 Implementar tests de Chat Image Preview (CIP-01 a CIP-03)
4. 🔄 Implementar tests de Flagged Messages (FLG-01 a FLG-05)

### **Fase 2: Completar Tests Faltantes**
1. 🔄 Implementar tests de Settings (SPF, SAC)
2. 🔄 Implementar tests de Notifications (NOT)
3. 🔄 Crear tests de Performance específicos

### **Fase 3: Optimización**
1. 🔄 Actualizar todos los workflows
2. 🔄 Crear reportes automáticos
3. 🔄 Integrar con KPIs del Excel
