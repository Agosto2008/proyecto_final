USE futurestar_db_in5bm;

DROP TRIGGER IF EXISTS trg_auditoria_no_update;
DROP TRIGGER IF EXISTS trg_auditoria_no_delete;

DELIMITER $$

CREATE TRIGGER trg_auditoria_no_update
BEFORE UPDATE ON auditoria
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La tabla auditoria es de solo insercion: no se puede modificar';
END$$

CREATE TRIGGER trg_auditoria_no_delete
BEFORE DELETE ON auditoria
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La tabla auditoria es de solo insercion: no se puede borrar';
END$$

DELIMITER ;

SHOW TRIGGERS LIKE 'auditoria';