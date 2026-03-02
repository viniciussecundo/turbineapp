-- ========================================
-- Migration 005: Fix restrictive DELETE policies
--
-- Problema: as policies RESTRICTIVE de DELETE só permitiam o role 'admin'.
-- O mapa de permissões do frontend (use-permissions.ts) permite que 'finance'
-- delete transações (finance.delete). Sem essa correção, o DELETE silenciosamente
-- não afeta nenhuma linha e o registro reaparece após refresh.
--
-- Correção: atualizar a policy RESTRICTIVE de DELETE para transactions,
-- permitindo também o role 'finance', alinhado com a documentação e o PRD.
-- ========================================

-- ── TRANSACTIONS: admin e finance podem deletar ──
DROP POLICY IF EXISTS "transactions: role delete" ON transactions;
CREATE POLICY "transactions: role delete" ON transactions AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (public.get_user_role() IN ('admin', 'finance'));
