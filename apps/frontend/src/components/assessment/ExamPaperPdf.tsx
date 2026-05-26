import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { AssessmentPaper } from '@vedaai/shared-types';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica' },
  title: { fontSize: 16, textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
  headerLine: { flexDirection: 'row', marginBottom: 8 },
  label: { width: 100, fontWeight: 'bold' },
  line: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#333' },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', marginTop: 16, marginBottom: 4 },
  instruction: { fontStyle: 'italic', marginBottom: 12, color: '#555' },
  question: { marginBottom: 12 },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  marks: { fontWeight: 'bold' },
});

interface ExamPaperPdfProps {
  paper: AssessmentPaper;
}

export function ExamPaperPdf({ paper }: ExamPaperPdfProps) {
  let qNum = 1;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{paper.title}</Text>
        <View style={styles.headerLine}>
          <Text style={styles.label}>Name:</Text>
          <View style={styles.line} />
        </View>
        <View style={styles.headerLine}>
          <Text style={styles.label}>Roll Number:</Text>
          <View style={styles.line} />
        </View>
        <View style={styles.headerLine}>
          <Text style={styles.label}>Section:</Text>
          <View style={styles.line} />
        </View>

        {paper.sections.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.instruction}>{section.instruction}</Text>
            {section.questions.map((q) => {
              const num = qNum++;
              return (
                <View key={num} style={styles.question}>
                  <View style={styles.questionHeader}>
                    <Text>
                      Q{num}. [{q.difficulty}] 
                    </Text>
                    <Text style={styles.marks}>[{q.marks} marks]</Text>
                  </View>
                  <Text>{q.question}</Text>
                  {q.type === 'mcq' && q.options?.map((opt, i) => (
                    <Text key={i}>
                      {String.fromCharCode(65 + i)}. {opt}
                    </Text>
                  ))}
                </View>
              );
            })}
          </View>
        ))}
      </Page>
    </Document>
  );
}
